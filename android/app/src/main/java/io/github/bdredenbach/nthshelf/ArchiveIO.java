package io.github.bdredenbach.nthshelf;

import java.io.*;
import java.security.*;
import java.util.*;
import java.util.function.BooleanSupplier;
import java.util.zip.*;

/** Bounded-buffer ZIP primitives, shared by Android and the plain JVM regression. */
final class ArchiveIO {
    static final int CHUNK = 196608;
    static final int MANIFEST_LIMIT = 8 * 1024 * 1024;
    static void check(BooleanSupplier cancelled) throws IOException {
        if (cancelled.getAsBoolean()) throw new IOException("Transfer cancelled.");
    }
    static MessageDigest digest() {
        try { return MessageDigest.getInstance("SHA-256"); }
        catch (NoSuchAlgorithmException e) { throw new IllegalStateException(e); }
    }
    static final class Writer implements Closeable {
        final MessageDigest hash = digest();
        final ZipOutputStream zip;
        final BooleanSupplier cancelled;
        boolean entry;
        Writer(OutputStream output, BooleanSupplier cancelled) {
            this.cancelled = cancelled;
            zip = new ZipOutputStream(new BufferedOutputStream(new DigestOutputStream(output, hash), 65536));
            // Images are already compressed. ZIP level 0 supports streaming descriptors and ZIP64.
            zip.setLevel(0);
        }
        void begin(String name) throws IOException {
            check(cancelled);
            if (entry || name.isEmpty() || name.startsWith("/") || name.contains("..") || name.contains("\\"))
                throw new IOException("Invalid archive entry.");
            zip.putNextEntry(new ZipEntry(name)); entry = true;
        }
        void write(byte[] bytes) throws IOException {
            check(cancelled);
            if (!entry || bytes.length > CHUNK) throw new IOException("Invalid archive chunk.");
            zip.write(bytes);
        }
        void end() throws IOException { check(cancelled); if (!entry) throw new IOException("No entry."); zip.closeEntry(); entry=false; }
        byte[] finish() throws IOException {
            check(cancelled); if (entry) throw new IOException("An archive entry is incomplete.");
            zip.close(); return hash.digest();
        }
        public void close() throws IOException { zip.close(); }
    }
    interface Progress { void update(long bytes); }
    static void verify(InputStream input, byte[] expected, BooleanSupplier cancelled, Progress progress) throws IOException {
        MessageDigest hash = digest(); byte[] buffer = new byte[65536]; long total=0; int n;
        try (InputStream in = input) {
            while ((n=in.read(buffer))!=-1) { check(cancelled);hash.update(buffer,0,n);total+=n;progress.update(total); }
        }
        check(cancelled);
        if (!MessageDigest.isEqual(expected,hash.digest())) throw new IOException("The saved backup failed verification.");
    }
    static final class Catalog {
        String manifest;
        long bytes, entries;
    }
    static Catalog inspect(InputStream input, BooleanSupplier cancelled, Progress progress) throws IOException {
        Catalog result = new Catalog(); byte[] buffer = new byte[65536]; Set<String> names = new HashSet<>();
        try (ZipInputStream zip = new ZipInputStream(new BufferedInputStream(input))) {
            ZipEntry entry;
            while ((entry=zip.getNextEntry())!=null) {
                check(cancelled);
                if (++result.entries>1000000 || !names.add(entry.getName())) throw new IOException("Invalid or duplicate archive entries.");
                ByteArrayOutputStream manifest = entry.getName().equals("nth-shelf-backup.json") ? new ByteArrayOutputStream() : null;
                int n;
                while ((n=zip.read(buffer))!=-1) {
                    check(cancelled);result.bytes+=n;progress.update(result.bytes);
                    if (manifest!=null) {
                        if (manifest.size()+n>MANIFEST_LIMIT) throw new IOException("Backup index is too large.");
                        manifest.write(buffer,0,n);
                    }
                }
                zip.closeEntry(); // ZipInputStream verifies entry CRC and length while reading.
                if (manifest!=null) result.manifest=manifest.toString("UTF-8");
            }
        }
        if (result.manifest==null) throw new IOException("Not an Nth Shelf full backup. For legacy JSON, choose Import legacy backup.");
        return result;
    }
}
