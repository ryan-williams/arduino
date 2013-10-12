
#include "Adafruit_WS2801.h"
#include "utils.h"

void oneColor(Adafruit_WS2801 &strip, uint32_t c) {
  for (int j = 0; j < strip.numPixels(); j++) {
    strip.setPixelColor(j, c);
  }
  strip.show();
}

uint32_t C(byte r, byte g, byte b)
{
  uint32_t c;
  c = r;
  c <<= 8;
  c |= g;
  c <<= 8;
  c |= b;
  return c;
}

