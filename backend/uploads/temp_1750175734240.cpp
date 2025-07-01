// C++ program to find gcd of two numbers using 
// inbuilt __gcd() and gdc() function
#include <bits/stdc++.h>
using namespace std;

int main() {
  	int a = 12, b = 16;

	// Finding gcd of a and b using __gcd()
  	cout << __gcd(a, b) << endl;
  
	// Finding gcd of a and b using gcd()
  	cout << gcd(a, b);
  
	return 0;
}