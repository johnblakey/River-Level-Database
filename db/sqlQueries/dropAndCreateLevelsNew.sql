-- remove levels table
DROP TABLE levels;

-- create levels table
CREATE TABLE "levels" ( 
[LevelId] INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL, 
[levelValue] NVARCHAR(16) NOT NULL, 
[dateTime] DATETIME_TEXT NOT NULL,
[riverId] INTEGER, 
FOREIGN KEY ([riverId])
REFERENCES "rivers" ([RiverId])
ON DELETE NO ACTION
ON UPDATE NO ACTION )