# gpx-time
Add times to gpx files based on distance between points.

## Build
``` bash
docker build -t gpx-time -f docker/Dockerfile .
```

## Run
``` bash
docker run --rm -ti -u $(id -u):$(id -g) -v /etc/localtime:/etc/localtime -v "$(pwd)":"$(pwd)" -w "$(pwd)" gpx-time <filename> <activity> <starttime> <endtime>
```
Example:
``` bash
docker run --rm -ti -u $(id -u):$(id -g) -v /etc/localtime:/etc/localtime -v "$(pwd)":"$(pwd)" -w "$(pwd)" gpx-time "Blueberry Mountain.gpx" Hiking "2021-05-30 09:30:00" "2021-05-30 14:30:00"
```

## Run in dev
``` bash
docker run --rm -ti -u $(id -u):$(id -g) -v /etc/localtime:/etc/localtime -v "$(pwd)":"$(pwd)" -w "$(pwd)" -v "$(pwd)/src/index.js":/app/index.js -v /app/node_modules gpx-time "Blueberry Mountain.gpx" Hiking "2021-05-30 09:30:00" "2021-05-30 14:30:00"
```
