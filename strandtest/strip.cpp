
#include "strip.h"

#include <utils.h>
#include "Adafruit_WS2801.h"

// include core Wiring API
#include "Arduino.h"
// include description files for other libraries used (if any)
#include "HardwareSerial.h"
#include "MemoryFree.h"

#include "macros.h"

Strip::Strip() {

	// Set the first variable to the NUMBER of pixels. 25 = 25 pixels in a row
    P("Ada before: "); PL(strip->getPixelArrayAddress());
	strip = new Adafruit_WS2801(25, dataPin, clockPin);
    P("Ada after: "); PL(strip->getPixelArrayAddress());

	length = strip->numPixels();
	strip->begin();

	P("pixels pre-calloc: "); PPL(pixels);
	pixels = (uint32_t*)calloc(length, 4);
	P("pixels post-calloc: "); PPL(pixels);
	setColor(0);
}

Strip::~Strip() {
	delete strip;
	free(pixels);
}

void Strip::printColor(uint32_t color, bool newLine) {
	P('(');
	P(color);
	P(')');
	if (newLine) {
		NL;
	}
}

Strip* Strip::setColor(uint32_t color) {
	for (int j = 0; j < length; j++) {
		pixels[j] = color;
	}
	return this;
}

Strip* Strip::setColors(uint32_t colors[]) {
	for (int j = 0; j < length; j++) {
		pixels[j] = colors[j];
	}
	return this;
}

Strip* Strip::setColor(uint32_t color, double intensities[]) {
	for (int j = 0; j < length; j++) {
		pixels[j] = CI(color, intensities[j]);
	}
	return this;
}

Strip* Strip::setColors(uint32_t colors[], double intensities[]) {
	for (int j = 0; j < length; j++) {
		pixels[j] = CI(colors[j], intensities[j]);
	}
	return this;
}

Strip* Strip::rotate(int step) {
	if (step == 0) return this;
	while (step < 0) { step += length; }
	step %= length;
	uint32_t startIdx = 0, numSet = 0;
	while (numSet < length && startIdx < step) {
		uint32_t curIdx = startIdx, tmp = pixels[curIdx];
		while (true) {
			uint32_t nextIdx = (curIdx + length - step) % length;
			if (nextIdx == startIdx) {
				pixels[curIdx] = tmp;
				numSet++;
				break;
			}
			pixels[curIdx] = pixels[nextIdx];
			numSet++;
			curIdx = nextIdx;
		}
		startIdx++;
	}
	return this;
}


void Strip::clear() {
	setColor(0);
	show();
}

void Strip::show(bool shouldPrint) {
	for (int j = 0; j < this->length; j++) {
		strip->setPixelColor(j, this->pixels[j]);
	}
	strip->show();
}



void Strip::print() {
	P("print: ");
	P((long unsigned int)this);
	P(": \t");
	for (int j = 0; j < length; j++) {
		printColor(pixels[j]);
	}
	NL;
}

