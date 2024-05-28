// pang store lang ug test cases kay dili macomment ang sa .txt

// IF extreme test case
BEGIN CODE
  BOOL flag1 = "FALSE"
  BOOL flag2 = "TRUE"
  INT result
IF (flag1)
BEGIN IF
  result = 2
  DISPLAY: result
END IF
ELSE IF (flag2)
BEGIN IF
  BOOL flag3 = FALSE
  BOOL flag4 = FALSE
  BOOL flag5 = TRUE
  IF ((1 < 2 AND 2 < 3) OR flag3)
    BEGIN IF
        DISPLAY: "inside nested if!"
    END IF
  ELSE IF (flag4)
    BEGIN IF
        DISPLAY: "inside nested if elseif!"
    END IF
  ELSE 
    BEGIN IF
        DISPLAY: "inside nested if ELSE"  
    END IF
END IF
END CODE