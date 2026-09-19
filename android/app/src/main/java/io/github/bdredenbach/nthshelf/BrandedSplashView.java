package io.github.bdredenbach.nthshelf;

import android.content.Context;
import android.graphics.Bitmap;
import android.graphics.Canvas;
import android.graphics.Color;
import android.graphics.LinearGradient;
import android.graphics.Paint;
import android.graphics.RectF;
import android.graphics.Shader;
import android.graphics.drawable.BitmapDrawable;
import android.widget.ImageView;

/** Fit the full artwork while blending its edges into a dark, fine-grain surround. */
final class BrandedSplashView extends ImageView {
    private final Paint fade = new Paint(Paint.ANTI_ALIAS_FLAG);
    private static final int PAPER = Color.rgb(5, 5, 5);

    BrandedSplashView(Context context) {
        super(context);
        Bitmap grain = Bitmap.createBitmap(64, 64, Bitmap.Config.ARGB_8888);
        java.util.Random random = new java.util.Random(27910);
        for (int y = 0; y < 64; y++) for (int x = 0; x < 64; x++) {
            int tone = 4 + random.nextInt(4);
            grain.setPixel(x, y, Color.rgb(tone, tone, tone));
        }
        BitmapDrawable surround = new BitmapDrawable(getResources(), grain);
        surround.setTileModeXY(Shader.TileMode.REPEAT, Shader.TileMode.REPEAT);
        setBackground(surround);
    }

    @Override protected void onDraw(Canvas canvas) {
        super.onDraw(canvas);
        if (getDrawable() == null) return;
        RectF art = new RectF(0, 0, getDrawable().getIntrinsicWidth(), getDrawable().getIntrinsicHeight());
        getImageMatrix().mapRect(art);
        art.offset(getPaddingLeft(), getPaddingTop());
        float edge = art.height() * .04f;
        if (edge <= 0) return;
        fade.setShader(new LinearGradient(0, art.top, 0, art.top + edge,
                PAPER, Color.TRANSPARENT, Shader.TileMode.CLAMP));
        canvas.drawRect(art.left, art.top, art.right, art.top + edge, fade);
        fade.setShader(new LinearGradient(0, art.bottom - edge, 0, art.bottom,
                Color.TRANSPARENT, PAPER, Shader.TileMode.CLAMP));
        canvas.drawRect(art.left, art.bottom - edge, art.right, art.bottom, fade);
    }
}
