package io.github.bdredenbach.nthshelf;

import java.io.*;
import java.nio.file.*;
import java.util.concurrent.atomic.AtomicBoolean;
import java.util.zip.*;

public final class ArchiveIOTest {
    public static void main(String[] args) throws Exception {
        nestedRoundTrip();
        File file=File.createTempFile("nth-stream-600MiB-", ".zip");
        try {
            byte[] chunk=new byte[65536];new java.util.Random(42).nextBytes(chunk);
            ArchiveIO.Writer writer=new ArchiveIO.Writer(new FileOutputStream(file),()->false);
            long expected=600L*1024*1024;
            for(int i=0;i<6;i++) {
                writer.begin("pages/0/"+i+".jpg");
                for(int n=0;n<1600;n++)writer.write(chunk);
                writer.end();
            }
            byte[] manifest="{\"app\":\"nth-shelf\",\"version\":2}".getBytes("UTF-8");
            writer.begin("nth-shelf-backup.json");writer.write(manifest);writer.end();
            byte[] digest=writer.finish();
            if(file.length()<=512L*1024*1024)throw new AssertionError("Fixture must exceed former limit");
            ArchiveIO.verify(new FileInputStream(file),digest,()->false,n->{});
            ArchiveIO.Catalog catalog=ArchiveIO.inspect(new FileInputStream(file),()->false,n->{});
            if(catalog.bytes!=expected+manifest.length||catalog.entries!=7)throw new AssertionError("Archive contents differ");
            // Same sequential read pattern used by the native restore bridge.
            long read=0,oldReplies=0;
            try(ZipInputStream zip=new ZipInputStream(new FileInputStream(file))) {
                ZipEntry entry;while((entry=zip.getNextEntry())!=null){int n;while((n=zip.read(chunk))!=-1){read+=n;oldReplies++;}}
            }
            if(read!=catalog.bytes)throw new AssertionError("Round trip lost data");
            long batchedBytes=0,newReplies=0;byte[] message=new byte[ArchiveIO.CHUNK];
            try(ZipInputStream zip=new ZipInputStream(new FileInputStream(file))) {
                while(zip.getNextEntry()!=null){int n;while((n=ArchiveIO.readChunk(zip,message,()->false))!=-1){batchedBytes+=n;newReplies++;}}
            }
            if(batchedBytes!=read||newReplies>610||oldReplies<newReplies*50)throw new AssertionError("Short-read batching failed");
            System.out.println("PASS: restore bridge payloads: "+oldReplies+" short reads -> "+newReplies+" batched replies, same "+read+" bytes");
            AtomicBoolean partialCancel=new AtomicBoolean();
            InputStream shortReads=new ByteArrayInputStream(new byte[2048]) {
                public synchronized int read(byte[] b,int o,int n){int result=super.read(b,o,Math.min(n,512));partialCancel.set(true);return result;}
            };
            boolean partialStopped=false;
            try{ArchiveIO.readChunk(shortReads,message,partialCancel::get);}catch(IOException e){partialStopped=true;}
            if(!partialStopped)throw new AssertionError("Cancellation during filled chunk failed");

            AtomicBoolean cancel=new AtomicBoolean();boolean stopped=false;
            try{ArchiveIO.verify(new FileInputStream(file),digest,cancel::get,n->{if(n>1048576)cancel.set(true);});}
            catch(IOException e){stopped=e.getMessage().contains("cancelled");}
            if(!stopped)throw new AssertionError("Cancellation failed");
            try(RandomAccessFile edit=new RandomAccessFile(file,"rw")){edit.seek(100);int b=edit.read();edit.seek(100);edit.write(b^1);}
            boolean corrupt=false;
            try{ArchiveIO.verify(new FileInputStream(file),digest,()->false,n->{});}catch(IOException e){corrupt=true;}
            if(!corrupt)throw new AssertionError("Verification accepted corrupt backup");
            corrupt=false;
            try{ArchiveIO.inspect(new FileInputStream(file),()->false,n->{});}catch(IOException e){corrupt=true;}
            if(!corrupt)throw new AssertionError("Restore scan accepted corrupt page");
            System.out.println("PASS: 600 MiB archive write/read/verify with 32 MiB heap; cancellation and corruption rejection");
        } finally {Files.deleteIfExists(file.toPath());}
    }
    static void nestedRoundTrip() throws Exception {
        ByteArrayOutputStream output=new ByteArrayOutputStream(),cache=new ByteArrayOutputStream();
        ArchiveIO.Writer outer=new ArchiveIO.Writer(output,()->false);
        outer.begin("sources/book.cbz");
        OutputStream tee=new OutputStream(){
            public void write(int b)throws IOException{outer.zip.write(b);cache.write(b);}
            public void write(byte[] b,int o,int n)throws IOException{outer.zip.write(b,o,n);cache.write(b,o,n);}
            public void close()throws IOException{outer.zip.flush();}
        };
        ArchiveIO.Writer inner=new ArchiveIO.Writer(tee,()->false);
        byte[] payload=new byte[ArchiveIO.CHUNK];new java.util.Random(11).nextBytes(payload);
        inner.begin("1.png");inner.write(payload);inner.end();inner.finish();outer.end();
        outer.begin("sources/cached.cbz");
        byte[] stored=cache.toByteArray();
        for(int o=0;o<stored.length;o+=ArchiveIO.CHUNK)outer.write(java.util.Arrays.copyOfRange(stored,o,Math.min(stored.length,o+ArchiveIO.CHUNK)));
        outer.end();byte[] hash=outer.finish();
        ArchiveIO.verify(new ByteArrayInputStream(output.toByteArray()),hash,()->false,n->{});
        try(ZipInputStream reader=new ZipInputStream(new ByteArrayInputStream(output.toByteArray()))) {
            for(int i=0;i<2;i++) {
                if(reader.getNextEntry()==null)throw new AssertionError("Nested source missing");
                ByteArrayOutputStream retained=new ByteArrayOutputStream();
                InputStream source=new FilterInputStream(reader){
                    public int read(byte[] b,int o,int n)throws IOException{int c=in.read(b,o,n);if(c>0)retained.write(b,o,c);return c;}
                    public int read()throws IOException{int b=in.read();if(b>=0)retained.write(b);return b;}
                    public void close(){}
                };
                ZipInputStream nested=new ZipInputStream(source);
                if(!nested.getNextEntry().getName().equals("1.png")||!java.util.Arrays.equals(nested.readAllBytes(),payload))throw new AssertionError("Nested page changed");
                if(nested.getNextEntry()!=null)throw new AssertionError("Unexpected page");
                while(source.read()!=-1){}nested.close();
                if(!java.util.Arrays.equals(retained.toByteArray(),stored))throw new AssertionError("Retained source lost central directory or bytes");
            }
        }
        System.out.println("PASS: nested CBZ creation, cached whole archive copy, SHA-256 verification, nested page restore and exact retained source bytes");
    }

}
