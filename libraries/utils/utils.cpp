
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

