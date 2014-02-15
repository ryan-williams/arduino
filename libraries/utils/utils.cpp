
#include "Adafruit_WS2801.h"
#include "utils.h"
// include description files for other libraries used (if any)
// #include "HardwareSerial.h"

byte r(uint32_t c) {
	return (byte)(c >>= 16);
}

byte g(uint32_t c) {
	return (byte)((c >>= 8) & 0xff);
}

byte b(uint32_t c) {
	return (byte)(c & 0xff);
}

uint32_t R(uint32_t c) {
  return c >>= 16;
}

uint32_t G(uint32_t c) {
  return (c >>= 8) & 0xff;
}

uint32_t B(uint32_t c) {
  return c & 0xff;
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

uint32_t avg(uint32_t base, uint32_t next, uint32_t w1, uint32_t w2) {
  return C(
      (byte)((w1*R(base) + w2*R(next)) / (w1 + w2)),
      (byte)((w1*G(base) + w2*G(next)) / (w1 + w2)),
      (byte)((w1*B(base) + w2*B(next)) / (w1 + w2))
    );
}

uint32_t CI(byte r, byte g, byte b, double i) {
	return C(
			(byte)((uint32_t)r * i),
			(byte)((uint32_t)g * i),
			(byte)((uint32_t)b * i)
		);
};

uint32_t CI(uint32_t c, double i) {
	return CI(r(c), g(c), b(c), i);
};

