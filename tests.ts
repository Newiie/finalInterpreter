// FACTORIAL CODE (WORKING)
BEGIN CODE
INT i, result=1, n

# Prompt for input
SCAN: n

# Factorial calculation
i = n
DISPLAY: "i: " & i & " " & "n: " & n & $
WHILE (i > 1)
BEGIN WHILE
    result = result * i
	i = i-1
END WHILE	

# Display result
DISPLAY: "Factorial of " & n & " is: " & result
END CODE