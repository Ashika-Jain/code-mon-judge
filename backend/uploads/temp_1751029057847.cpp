x = int(input())
if x < 0:
    print("false")
else:
    s = str(x)
    if s == s[::-1]:
        print("true")
    else:
        print("false")