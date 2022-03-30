convert "$1/$2".png -resize 700 -quality 60 "$1/$2_700w".png
convert "$1/$2".png -resize 1100 -quality 60 "$1/$2_1100w".png
convert "$1/$2".png -resize 1450 -quality 60 "$1/$2_1450w".png

convert "$1/$2".png -resize 700 -quality 100 "$1/$2_700w".webp
convert "$1/$2".png -resize 1100 -quality 100 "$1/$2_1100w".webp
convert "$1/$2".png -resize 1450 -quality 100 "$1/$2_1450w".webp