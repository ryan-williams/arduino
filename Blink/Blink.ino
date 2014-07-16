/*
  Blink
  Turns on an LED on for one second, then off for one second, repeatedly.
 
  This example code is in the public domain.
 */
 
// Pin 13 has an LED connected on most Arduino boards.
// give it a name:
int led = 13;

// the setup routine runs once when you press reset:
void setup() {                
  Serial.begin(9600); //This initialices the USB as a serial port

  // initialize the digital pin as an output.
  pinMode(led, OUTPUT);     
}

// the loop routine runs over and over again forever:
void loop() {
  bool on = false;
  char incomingByte = (char)Serial.read();

  Serial.print("byte: ");
  Serial.println((uint8_t)incomingByte);

  if(incomingByte=='1'){
    Serial.println("yay!");
    for (int x = 0; x < 5; x++) {
      digitalWrite(led,HIGH);
      delay(200);
      digitalWrite(led,LOW);
      delay(200);
    }
  }

  if (!on) {
    digitalWrite(led, HIGH);   // turn the LED on (HIGH is the voltage level)
  } else {
    digitalWrite(led, LOW);    // turn the LED off by making the voltage LOW
  }

  //Serial.print('.');
  on = !on;
  delay(1000);               // wait for a second
}
