#include <iostream>
#include <vector>
#include <unordered_map>
#include <sstream>
#include <string>

using namespace std;

vector<int> twoSum(vector<int>& nums, int target) {
    unordered_map<int, int> num_map;
    for (int i = 0; i < nums.size(); i++) {
        int complement = target - nums[i];
        if (num_map.count(complement)) {
            return {num_map[complement], i};
        }
        num_map[nums[i]] = i;
    }
    return {};
}

int main() {
    string input;
    getline(cin, input);  // Read the line: "[2,7,11,15], 9"

    size_t bracketPos = input.find(']');
    string numsPart = input.substr(0, bracketPos);
    string targetPart = input.substr(bracketPos + 2);  // skip ", "

    vector<int> nums;
    st