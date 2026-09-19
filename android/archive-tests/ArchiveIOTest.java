package io.github.bdredenbach.nthshelf;

import java.io.*;
import java.nio.file.*;
import java.util.concurrent.atomic.AtomicBoolean;
import java.util.zip.*;

public final class ArchiveIOTest {
    public static void main(String[] args) throws Exception {
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
            long read=0;
            try(ZipInputStream zip=new ZipInputStream(new FileInputStream(file))) {
                ZipEntry entry;while((entry=zip.getNextEntry())!=null){int n;while((n=zip.read(chunk))!=-1)read+=n;}
            }
            if(read!=catalog.bytes)throw new AssertionError("Round trip lost data");
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
}
