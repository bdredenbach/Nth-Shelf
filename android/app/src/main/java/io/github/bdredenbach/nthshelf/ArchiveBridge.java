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
    ZipInputStream reader;
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
                ArchiveIO.check(()->cancelled);
                Object result="";
                switch(action) {
                    case "archiveEntry": requireWriter();writer.begin(data.getString("name"));break;
                    case "archiveChunk":
                        requireWriter();String encoded=data.getString("data");
                        if(encoded.length()>262144)throw new IOException("Transfer chunk is too large.");
                        writer.write(Base64.decode(encoded,Base64.NO_WRAP));break;
                    case "archiveEndEntry":requireWriter();writer.end();break;
                    case "archiveFinish": {
                        requireWriter();byte[] expected=writer.finish();writer=null;
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
                        byte[] bytes=new byte[ArchiveIO.CHUNK];int n=reader.read(bytes);
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
        try{if(writer!=null)writer.close();}catch(Exception ignored){}writer=null;
        try{if(reader!=null)reader.close();}catch(Exception ignored){}reader=null;
        if(writing&&!complete&&uri!=null) {
            try {DocumentsContract.deleteDocument(activity.getContentResolver(),uri);}catch(Exception ignored){/* Provider may leave an incomplete file; never report success. */}
        }
        uri=null;busy=false;picking=false;
    }
    void destroy(){cancelled=true;io.execute(this::cleanup);io.shutdown();}
}
