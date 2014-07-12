
#include "color_array.h"

#include "Adafruit_WS2801.h"

ColorArray::ColorArray(int argCount, ...) {
	va_list ap;
	uint32_t i;

	arr = new uint32_t[2 * argCount];
	va_start(ap, 2 * argCount);
	numColors = argCount;

	for (i = 0; i < argCount; ++i) {
		arr[2*i] = (uint32_t)va_arg(ap, int);
		arr[2*i + 1] = va_arg(ap, uint32_t);
	}
	va_end(ap);

	setColorIdx(0);
}

uint32_t ColorArray::curColor() {
	return color(curColorIdx);
}

ColorArray* ColorArray::setColorIdx(uint32_t idx) {
	curColorIdx = idx;
	curColorCount = count(idx);
	curIntraColorIdx = 0;
	return this;
}

ColorArray* ColorArray::incColor() {
	return setColorIdx((curColorIdx + 1) % numColors);
}

ColorArray& ColorArray::operator++() {
	return *inc();
}

uint32_t ColorArray::count(uint32_t idx) {
	return arr[2 * idx];
}

uint32_t ColorArray::color(uint32_t idx) {
	return arr[2 * idx + 1];
}

ColorArray* ColorArray::inc() {
	++curIntraColorIdx;
	if (curIntraColorIdx >= curColorCount) incColor();
	return this;
}

ColorArray* ColorArray::add(uint32_t step) {
	while (step > 0) {
		if (curIntraColorIdx + step < curColorCount) {
			curIntraColorIdx += step;
			return this;
		}	
		step -= (curColorCount - curIntraColorIdx);
		incColor();
	}
}

ColorArray::~ColorArray() {
	delete[] arr;
}





