package io.github.bdredenbach.nthshelf;

import android.content.Context;
import android.graphics.Canvas;
import android.graphics.Color;
import android.graphics.Paint;
import android.graphics.RectF;
import android.graphics.Typeface;
import android.graphics.drawable.Drawable;
import android.widget.ImageView;

/** Shared HD illustration, vector branding and native text; never stretch a poster. */
final class BrandedSplashView extends ImageView {
    private final Paint paint = new Paint(Paint.ANTI_ALIAS_FLAG | Paint.FILTER_BITMAP_FLAG);
    private final Drawable brand;
    private final Drawable top;
    private final Drawable bottom;
    private static final int PAPER = Color.rgb(5, 5, 5);
    private static final int RED = Color.rgb(237, 32, 41);
    private static final String[] FORMATS = {"CBZ", "ZIP", "CBT", "CB7", "7Z", "CBR", "RAR"};

    BrandedSplashView(Context context) {
        super(context);
        setBackgroundColor(PAPER);
        brand = context.getDrawable(R.drawable.nth_shelf_brand);
        top = asset(context, "nth-shelf-top-hd.webp");
        bottom = asset(context, "nth-shelf-bottom-hd.webp");
        paint.setTextAlign(Paint.Align.CENTER);
    }

    private static Drawable asset(Context context, String name) {
        try (java.io.InputStream stream = context.getAssets().open("public/assets/" + name)) {
            return Drawable.createFromStream(stream, name);
        } catch (java.io.IOException ignored) { return null; }
    }

    private void drawFit(Canvas canvas, Drawable art, float x, float y, float w, float h) {
        if (art == null || w <= 0 || h <= 0) return;
        float scale = Math.min(w / art.getIntrinsicWidth(), h / art.getIntrinsicHeight());
        float aw = art.getIntrinsicWidth() * scale, ah = art.getIntrinsicHeight() * scale;
        art.setBounds(Math.round(x + (w-aw)/2), Math.round(y + (h-ah)/2),
                Math.round(x + (w+aw)/2), Math.round(y + (h+ah)/2));
        art.draw(canvas);
    }

    private void rule(Canvas canvas, float center, float y, float width) {
        paint.setColor(Color.rgb(116, 27, 32)); paint.setStrokeWidth(Math.max(1, width*.0015f));
        canvas.drawLine(center-width/2, y, center+width/2, y, paint);
        paint.setColor(RED); paint.setTextSize(width*.044f);
        canvas.drawText("✦", center, y+width*.015f, paint);
    }

    @Override protected void onDraw(Canvas canvas) {
        float left=getPaddingLeft(), topInset=getPaddingTop();
        float w=getWidth()-left-getPaddingRight(), h=getHeight()-topInset-getPaddingBottom();
        if(w<=0 || h<=0)return;
        canvas.drawColor(PAPER);
        float stripH=w/2.977f;
        drawFit(canvas,top,left,topInset,w,stripH);
        drawFit(canvas,bottom,left,topInset+h-stripH,w,stripH);
        float unit=Math.min(w,h*.72f), center=left+w/2;
        float brandH=unit*.29f, heroH=unit*.75f;
        float blockH=brandH+heroH+unit*.25f;
        float y=topInset+(h-blockH)/2;
        drawFit(canvas,brand,center-unit*.24f,y,unit*.48f,brandH);
        y+=brandH;
        drawFit(canvas,getDrawable(),center-unit/2,y,unit,heroH);
        y+=heroH;
        rule(canvas,center,y,unit*.83f); y+=unit*.075f;
        paint.setColor(Color.rgb(167,167,167)); paint.setTypeface(Typeface.create("sans-serif",Typeface.NORMAL));
        paint.setTextSize(unit*.037f);
        canvas.drawText("Everything stays on this device.",center,y,paint); y+=unit*.037f;
        float rowW=unit*.85f,gap=unit*.014f,cell=(rowW-6*gap)/7,cellH=unit*.10f;
        for(int i=0;i<FORMATS.length;i++) {
            float x=center-rowW/2+i*(cell+gap);
            paint.setColor(Color.rgb(131,33,42)); paint.setStrokeWidth(Math.max(1,unit*.0015f));paint.setStyle(Paint.Style.STROKE);
            canvas.drawRoundRect(new RectF(x,y,x+cell,y+cellH),unit*.016f,unit*.016f,paint);
            paint.setColor(Color.rgb(232,232,232));
            float cx=x+cell/2,iy=y+unit*.018f,iw=unit*.022f,ih=unit*.029f;
            canvas.drawRect(cx-iw/2,iy,cx+iw/2,iy+ih,paint);
            canvas.drawLine(cx-iw*.3f,iy+ih*.45f,cx+iw*.3f,iy+ih*.45f,paint);
            canvas.drawLine(cx-iw*.3f,iy+ih*.68f,cx+iw*.2f,iy+ih*.68f,paint);
            paint.setStyle(Paint.Style.FILL);paint.setTextSize(unit*.026f);
            canvas.drawText(FORMATS[i],cx,y+cellH*.82f,paint);
        }
        rule(canvas,center,y+cellH+unit*.025f,unit*.83f);
    }
}
