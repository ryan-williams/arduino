
#include "Adafruit_WS2801.h"
#include "utils.h"
// include description files for other libraries used (if any)
#include "HardwareSerial.h"

void oneColor(Adafruit_WS2801 &strip, uint32_t c) {
  for (int j = 0; j < strip.numPixels(); j++) {
    strip.setPixelColor(j, c);
  }
  strip.show();
}

byte r(uint32_t c) {
	return (byte)(c >>= 16);
}

byte g(uint32_t c) {
	return (byte)((c >>= 8) & 0xff00);
}

byte b(uint32_t c) {
	return (byte)(c & 0x0000ff);
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

void setArray(Adafruit_WS2801 &strip, uint32_t arr[]) {
	for (int j = 0; j < strip.numPixels(); j++) {
		strip.setPixelColor(j, arr[j]);
	}
	strip.show();
}

void setArray(Adafruit_WS2801 &strip, uint32_t color, double intensities[]) {
	for (int j = 0; j < strip.numPixels(); j++) {
		strip.setPixelColor(j, CI(color, intensities[j]));
	}
	strip.show();
}

#include <stdarg.h>
void p(char *fmt, ... ){
        // char tmp[512]; // resulting string limited to 128 chars
        // va_list args;
        // va_start (args, fmt );
        // vsnprintf(tmp, 512, fmt, args);
        // va_end (args);
        // Serial.print(tmp);
}

void rot(double arr[], uint32_t length, uint32_t step) {
	uint32_t startIdx = 0, numSet = 0;
	p("\nrot: %d\n", step);
	while (numSet < length && startIdx < step) {
		p("\tstartIdx: %d, numSet: %d\n", startIdx, numSet);
		uint32_t curIdx = startIdx;
		double tmp = arr[curIdx];
		while (true) {
			uint32_t nextIdx = (curIdx + step) % length;
			p("\t\tcurIdx: %d, nextIdx: %d, val: ", curIdx, nextIdx);
			if (nextIdx == startIdx) {
				arr[curIdx] = tmp;
				Serial.println(tmp);
				numSet++;
				break;
			}
			Serial.println(arr[nextIdx]);
			arr[curIdx] = arr[nextIdx];
			numSet++;
			curIdx = nextIdx;
		}
		p("\tDone with startIdx: %d\n", startIdx);
		startIdx++;
	}
	p("All done!\n\n");
}

void swap(int& a, int& b) {
	a ^= b;
	b ^= a;
	a ^= b;
}

// void rot(int& a, int& b, int& c) {
// 	a ^= c;
// 	b ^= a;
// 	c ^= b;
// }

void print(double arr[], uint32_t length) {
	for (int j = 0; j < length; j++) {
		Serial.print(arr[j]);
		Serial.print(", ");
	}
	Serial.print("\n");
}
