
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
	strip = new Adafruit_WS2801(125, dataPin, clockPin);
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

uint32_t Strip::sanitizeStep(int step) {
	while (step < 0) { step += length; }
	return (step % length);
}

Strip* Strip::rotate(int unsanitizedStep, bool wrapAround) {
	uint32_t step = sanitizeStep(unsanitizedStep);
	if (step == 0) return this;
	int startIdx = length - 1, numSet = 0, numOuterLoops = 0;
	while (numSet < length && numOuterLoops < step) {
		uint32_t curIdx = startIdx, tmp = pixels[curIdx];
		while (true) {
			// uint32_t nextIdx = (curIdx + length - step) % length;
			int rawNextIdx = ((int)curIdx) - ((int)step);
			if (rawNextIdx < 0) {
				if (!wrapAround) break;
				rawNextIdx += length;
			}
			if (rawNextIdx >= length) {
				if (!wrapAround) break;
			}
			uint32_t nextIdx = ((uint32_t)rawNextIdx) % length;
			if (nextIdx == startIdx) {
				pixels[curIdx] = tmp;
				numSet++;
				break;
			}
			pixels[curIdx] = pixels[nextIdx];
			numSet++;
			curIdx = nextIdx;
		}
		--startIdx;
		++numOuterLoops;
	}
	return this;
}

Strip* Strip::blendRight(int diffusion) {
	int curIdx = 1;
	for (; curIdx < length; ++curIdx) {
		pixels[curIdx] = avg(pixels[curIdx], pixels[curIdx - 1], (uint32_t)diffusion);
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

