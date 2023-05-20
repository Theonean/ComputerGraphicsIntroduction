function generatePalette(size, paletteType) {
    const arrayRGBRed = [];
    const arrayRGBGreen = [];
    const arrayRGBBlue = [];

    const baseHue = Math.random();

    for (let i = 0; i < size; i++) {
        let hue;

        switch (paletteType) {
            case "monochromatic":
                hue = baseHue;
                break;
            case "analogous":
                hue = (baseHue + i / 12) % 1;
                break;
            case "complementary":
                hue = (baseHue + i / size) % 1;
                break;
            case "split-complementary":
                hue = (baseHue + i / (size * 2)) % 1;
                break;
            case "triad":
                hue = (baseHue + i / 3) % 1;
                break;
            case "tetradic":
                hue = (baseHue + i / 4) % 1;
                break;
            default:
                throw new Error("Invalid palette type: " + paletteType);
        }

        const rgb = hslToRgb(hue, Math.random(), Math.random());

        arrayRGBRed.push(rgb[0]);
        arrayRGBGreen.push(rgb[1]);
        arrayRGBBlue.push(rgb[2]);
    }

    return {
        red: arrayRGBRed,
        green: arrayRGBGreen,
        blue: arrayRGBBlue,
    };
}

function hslToRgb(h, s, l) {
    let r, g, b;

    if (s == 0) {
        r = g = b = l; // achromatic
    } else {
        const hue2rgb = function hue2rgb(p, q, t) {
            if (t < 0) t += 1;
            if (t > 1) t -= 1;
            if (t < 1 / 6) return p + (q - p) * 6 * t;
            if (t < 1 / 2) return q;
            if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
            return p;
        };

        const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
        const p = 2 * l - q;
        r = hue2rgb(p, q, h + 1 / 3);
        g = hue2rgb(p, q, h);
        b = hue2rgb(p, q, h - 1 / 3);
    }

    return [r, g, b];//[Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
}

function getRandomColorFromPalette(palette) {
    const index = Math.floor(Math.random() * palette.length);

    const r = palette.red[index];
    const g = palette.green[index];
    const b = palette.blue[index];
    const a = 255; // You can change this to your desired alpha value

    return [r, g, b, a];
}

function clamp(value, min, max) {
    return Math.min(Math.max(value, min), max);
}

// function areAreasIntersecting(area1, area2) { 
//     return !(
//         area1.x > area2.x + area2.width  || area1.x + area1.width  < area2.x ||
//         area1.y > area2.y + area2.height || area1.y + area1.height < area2.y 
//     );
// }


function areAreasIntersecting(area1, area2) { 
        if (area1.x > area2.x + area2.width) return false
        if (area1.x + area1.width  < area2.x) return false
        if (area1.y > area2.y + area2.height) return false
        if (area1.y + area1.height < area2.y) return false
        return true 
}
