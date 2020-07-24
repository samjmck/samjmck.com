convert "$1/$2".png -resize 900 -quality 60 "$1/$2_900w".png
convert "$1/$2".png -resize 1400 -quality 60 "$1/$2_1400w".png
convert "$1/$2".png -resize 1700 -quality 60 "$1/$2_1700w".png

convert "$1/$2".png -resize 900 -quality 95 "$1/$2_900w".webp
convert "$1/$2".png -resize 1400 -quality 95 "$1/$2_1400w".webp
convert "$1/$2".png -resize 1700 -quality 95 "$1/$2_1700w".webp