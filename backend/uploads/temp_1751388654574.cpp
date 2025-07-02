#include <iostream>
#include <vector>
#include <unordered_map>
#include <sstream>
#include <string>

using namespace std;

vector<int> twoSum(const vector<int>& nums, int target) {
    unordered_map<int, int> seen;
    for (int i = 0; i < nums.size(); i++) {
        int complement = target - nums[i];
        if (seen.count(complement)) {
            return {seen[complement], i};
        }
        seen[nums[i]] = i;
    }
    return {};
}

int main() {
    string input;
    getline(cin, input);  // input: "[2,7,11,15], 9"

    // Parse the array part
    size_t closeBracket = input.find(']');
    string numsStr = input.substr(1, closeBracket - 1);  // remove leading '[' and trailing ']'
    string targetStr = input.substr(closeBrack