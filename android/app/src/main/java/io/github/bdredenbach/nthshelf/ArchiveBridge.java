package io.github.bdredenbach.nthshelf;

import android.app.Activity;
import android.content.Intent;
import android.net.Uri;
import android.provider.DocumentsContract;
import android.util.Base64;
import androidx.webkit.JavaScriptReplyProxy;
import org.json.JSONObject;
import java.io.*;
import java.util.concurrent.*;
import java.util.zip.*;

/** Serial, acknowledged archive I/O. Only the exact-origin ShelfBridge can reach it. */
final class ArchiveBridge {
    static final int SAVE=27921, OPEN=27922;
    final Activity activity;
    final ExecutorService io=Executors.newSingleThreadExecutor();
    volatile boolean cancelled;
    boolean busy, picking, writing, complete;
    Uri uri;
    ArchiveIO.Writer writer;
    ZipInputStream reader, nestedReader;
    ArchiveIO.Writer bookWriter;
    OutputStream sourceCopy;
    InputStream sourceInput;
    File sourceTemp, sourceFinal;
    boolean cachingEntry;
    File cacheFile(String key) {
        byte[] hash=ArchiveIO.digest().digest(key.getBytes(java.nio.charset.StandardCharsets.UTF_8));
        StringBuilder name=new StringBuilder();for(byte b:hash)name.append(String.format("%02x",b&255));
        File dir=new File(activity.getFilesDir(),"comic-sources");dir.mkdirs();return new File(dir,name+".archive");
    }
    void beginCache(String key) throws IOException {
        sourceFinal=cacheFile(key);sourceTemp=new File(sourceFinal.getPath()+".partial");sourceCopy=new BufferedOutputStream(new FileOutputStream(sourceTemp));
    }
    void endCache() throws IOException {
        if(sourceCopy!=null){sourceCopy.close();sourceCopy=null;}
        if(sourceTemp!=null&&!sourceTemp.renameTo(sourceFinal))throw new IOException("Could not retain comic archive.");
        sourceTemp=null;sourceFinal=null;
    }
    OutputStream tee(OutputStream first) {
        return new OutputStream(){public void write(int b)throws IOException{first.write(b);sourceCopy.write(b);}
            public void write(byte[] b,int o,int n)throws IOException{first.write(b,o,n);sourceCopy.write(b,o,n);}
            public void flush()throws IOException{first.flush();sourceCopy.flush();}
            public void close()throws IOException{flush();}};
    }
    void writeBytes(byte[] bytes)throws IOException {
        if(bookWriter!=null)bookWriter.write(bytes);
        else {requireWriter();writer.write(bytes);if(cachingEntry)sourceCopy.write(bytes);}
    }
    void receiveBinary(byte[] packet,JavaScriptReplyProxy proxy) {
        if(packet==null||packet.length<8||packet.length>ArchiveIO.CHUNK+8)return;
        java.nio.ByteBuffer header=java.nio.ByteBuffer.wrap(packet).order(java.nio.ByteOrder.LITTLE_ENDIAN);
        if(header.getInt()!=0x4e544842)return;int id=header.getInt();
        io.execute(()->{try{ArchiveIO.check(()->cancelled);writeBytes(java.util.Arrays.copyOfRange(packet,8,packet.length));reply(proxy,id,true,"");}
            catch(Exception e){cleanup();reply(proxy,id,false,e.getMessage());}});
    }
    JavaScriptReplyProxy pickerReply;
    int pickerId;
    long lastProgress;
    ArchiveBridge(Activity activity) {this.activity=activity;}
    void reply(JavaScriptReplyProxy proxy,int id,boolean ok,Object data) {
        try {
            JSONObject json=new JSONObject().put("id",id).put("ok",ok).put(ok?"data":"message",data);
            activity.runOnUiThread(()->proxy.postMessage(json.toString()));
        } catch(Exception ignored) {}
    }
    void progress(JavaScriptReplyProxy proxy,int id,long bytes) {
        long now=System.currentTimeMillis();if(now-lastProgress<250)return;lastProgress=now;
        try {
            String json=new JSONObject().put("id",id).put("progress",bytes).toString();
            activity.runOnUiThread(()->proxy.postMessage(json));
        }catch(Exception ignored){}
    }
    void receive(JSONObject data,int id,String action,JavaScriptReplyProxy reply) {
        // Set immediately on the UI thread, even during verification on the I/O worker.
        if(action.equals("archiveCancel"))cancelled=true;
        io.execute(()->{
            try {
                if(action.equals("archiveCreate")||action.equals("archiveOpen")) {
                    if(busy)throw new IOException("Another archive transfer is active.");
                    busy=true;picking=true;cancelled=false;complete=false;writing=action.equals("archiveCreate");
                    pickerReply=reply;pickerId=id;
                    final boolean save=writing;
                    final String name=data.optString("name","Nth-Shelf.nthshelf").replaceAll("[^a-zA-Z0-9._ -]","_");
                    activity.runOnUiThread(()->{
                        try {
                            Intent intent=new Intent(save?Intent.ACTION_CREATE_DOCUMENT:Intent.ACTION_OPEN_DOCUMENT);
                            intent.addCategory(Intent.CATEGORY_OPENABLE);intent.setType(save?"application/zip":"*/*");
                            if(save)intent.putExtra(Intent.EXTRA_TITLE,name);
                            activity.startActivityForResult(intent,save?SAVE:OPEN);
                        } catch(Exception e) {io.execute(()->{reply(pickerReply,pickerId,false,"File picker could not open.");cleanup();});}
                    });return;
                }
                if(action.equals("archiveCancel")) {
                    if(picking) {reply(reply,id,true,"");return;}
                    cleanup();reply(reply,id,true,"");return;
                }
                if(busy && !action.equals("archiveDropCache")) ArchiveIO.check(()->cancelled);
                Object result="";
                switch(action) {
                    case "archiveCapabilities": result=new JSONObject().put("binary",androidx.webkit.WebViewFeature.isFeatureSupported(androidx.webkit.WebViewFeature.WEB_MESSAGE_ARRAY_BUFFER)).put("sources",true);break;
                    case "archiveDropCache": {File f=cacheFile(data.getString("key"));f.delete();new File(f.getPath()+".partial").delete();break;}
                    case "archiveCacheInfo": {File f=cacheFile(data.getString("key"));result=f.isFile()?new JSONObject().put("size",f.length()):JSONObject.NULL;break;}
                    case "archiveCachedSource": {
                        requireWriter();File f=cacheFile(data.getString("key"));
                        writer.begin(data.getString("name"));
                        try(InputStream in=new BufferedInputStream(new FileInputStream(f))){byte[] b=new byte[ArchiveIO.CHUNK];int n;long copied=0;
                            while((n=in.read(b))!=-1){writer.write(n==b.length?b:java.util.Arrays.copyOf(b,n));copied+=n;progress(reply,id,copied);}}
                        writer.end();break;
                    }
                    case "archiveBookBegin":
                        requireWriter();writer.begin(data.getString("name"));beginCache(data.getString("key"));
                        bookWriter=new ArchiveIO.Writer(tee(writer.zip),()->cancelled);break;
                    case "archiveBookEnd": {
                        if(bookWriter==null)throw new IOException("No comic archive is open.");
                        bookWriter.finish();bookWriter=null;writer.end();endCache();break;
                    }
                    case "archiveSourceOpen": {
                        if(reader==null||sourceInput!=null)throw new IOException("No source entry available.");
                        beginCache(data.getString("key"));
                        sourceInput=new FilterInputStream(reader){
                            public int read(byte[] b,int o,int n)throws IOException{int count=in.read(b,o,n);if(count>0)sourceCopy.write(b,o,count);return count;}
                            public int read()throws IOException{int b=in.read();if(b>=0)sourceCopy.write(b);return b;}
                            public void close(){}
                        };
                        if(data.optBoolean("nested"))nestedReader=new ZipInputStream(sourceInput);
                        break;
                    }
                    case "archiveSourceNext": {
                        if(nestedReader==null)throw new IOException("No nested comic is open.");
                        ZipEntry next=nestedReader.getNextEntry();
                        if(next==null){byte[] b=new byte[65536];while(sourceInput.read(b)!=-1)ArchiveIO.check(()->cancelled);nestedReader.close();nestedReader=null;sourceInput=null;endCache();result=JSONObject.NULL;}
                        else result=new JSONObject().put("name",next.getName()).put("directory",next.isDirectory());
                        break;
                    }
                    case "archiveEntry": requireWriter();(bookWriter!=null?bookWriter:writer).begin(data.getString("name"));
                        if(data.has("key")&&bookWriter==null){beginCache(data.getString("key"));cachingEntry=true;}break;
                    case "archiveChunk":
                        requireWriter();String encoded=data.getString("data");
                        if(encoded.length()>262144)throw new IOException("Transfer chunk is too large.");
                        writeBytes(Base64.decode(encoded,Base64.NO_WRAP));break;
                    case "archiveEndEntry":requireWriter();(bookWriter!=null?bookWriter:writer).end();
                        if(cachingEntry){endCache();cachingEntry=false;}break;
                    case "archiveFinish": {
                        requireWriter();if(bookWriter!=null)throw new IOException("A comic archive is incomplete.");byte[] expected=writer.finish();writer=null;
                        InputStream in=activity.getContentResolver().openInputStream(uri);
                        if(in==null)throw new IOException("Cannot reopen saved backup for verification.");
                        ArchiveIO.verify(in,expected,()->cancelled,n->progress(reply,id,n));
                        complete=true;result="Full library backup saved and verified.";cleanup();break;
                    }
                    case "archiveNext": {
                        if(reader==null)throw new IOException("No backup is open.");
                        ZipEntry entry=reader.getNextEntry();
                        result=entry==null?JSONObject.NULL:new JSONObject().put("name",entry.getName()).put("size",entry.getSize()).put("directory",entry.isDirectory());break;
                    }
                    case "archiveRead": {
                        if(reader==null)throw new IOException("No backup is open.");
                        byte[] bytes=new byte[ArchiveIO.CHUNK];int n=(nestedReader!=null?nestedReader:sourceInput!=null?sourceInput:reader).read(bytes);
                        if(n<0&&sourceInput!=null&&nestedReader==null){sourceInput=null;endCache();}
                        result=n<0?JSONObject.NULL:Base64.encodeToString(bytes,0,n,Base64.NO_WRAP);break;
                    }
                    case "archiveClose":complete=true;cleanup();break;
                    default:throw new IOException("Unknown archive request.");
                }
                reply(reply,id,true,result);
            }catch(Exception e){cleanup();reply(reply,id,false,e.getMessage()==null?"Archive transfer failed.":e.getMessage());}
        });
    }
    void result(int code,Intent data) {
        io.execute(()->{
            JavaScriptReplyProxy proxy=pickerReply;int id=pickerId;
            try {
                picking=false;
                if(!busy||code!=Activity.RESULT_OK||data==null||data.getData()==null)throw new IOException("Transfer cancelled. Your library was not changed.");
                uri=data.getData();ArchiveIO.check(()->cancelled);
                Object result="";
                if(writing){
                    OutputStream out=activity.getContentResolver().openOutputStream(uri,"wt");
                    if(out==null)throw new IOException("Destination is unavailable.");
                    writer=new ArchiveIO.Writer(out,()->cancelled);
                } else {
                    InputStream in=activity.getContentResolver().openInputStream(uri);
                    if(in==null)throw new IOException("Backup is unavailable.");
                    ArchiveIO.Catalog catalog=ArchiveIO.inspect(in,()->cancelled,n->progress(proxy,id,n));
                    in=activity.getContentResolver().openInputStream(uri);
                    if(in==null)throw new IOException("Cannot reopen backup.");
                    reader=new ZipInputStream(new BufferedInputStream(in));
                    result=new JSONObject().put("manifest",catalog.manifest).put("bytes",catalog.bytes);
                }
                reply(proxy,id,true,result);
            }catch(Exception e){cleanup();reply(proxy,id,false,e.getMessage());}
            pickerReply=null;
        });
    }
    void requireWriter() throws IOException {if(writer==null)throw new IOException("No backup destination is open.");}
    void cleanup() {
        try{if(bookWriter!=null)bookWriter.close();}catch(Exception ignored){}bookWriter=null;
        try{if(sourceCopy!=null)sourceCopy.close();}catch(Exception ignored){}sourceCopy=null;
        if(sourceTemp!=null)sourceTemp.delete();sourceTemp=null;sourceFinal=null;cachingEntry=false;
        nestedReader=null;sourceInput=null;
        try{if(writer!=null)writer.close();}catch(Exception ignored){}writer=null;
        try{if(reader!=null)reader.close();}catch(Exception ignored){}reader=null;
        if(writing&&!complete&&uri!=null) {
            try {DocumentsContract.deleteDocument(activity.getContentResolver(),uri);}catch(Exception ignored){/* Provider may leave an incomplete file; never report success. */}
        }
        uri=null;busy=false;picking=false;
    }
    void destroy(){cancelled=true;io.execute(this::cleanup);io.shutdown();}
}
