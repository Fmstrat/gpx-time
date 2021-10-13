const { getDistance, getCenter, getPathLength, getRhumbLineBearing, computeDestinationPoint } = require('geolib');
const xml2js = require('xml2js');
const fs = require('fs');
const path = require('path');

async function addPoints(_in) {
    let secondsBetweenPoints = 9;
    let _out = [];
    _out.push(_in[0]);
    for (i = 1; i < _in.length; i++) {
        let startTime = new Date(_in[i-1].time);
        let endTime = new Date(_in[i].time);
        let span = endTime.getTime() / 1000 - startTime.getTime() / 1000;
        let startEle = Number.parseFloat(_in[i-1].ele);
        let endEle = Number.parseFloat(_in[i].ele);
        let startLoc = { latitude: _in[i-1]['$'].lat, longitude: _in[i-1]['$'].lon };
        let endLoc = { latitude: _in[i]['$'].lat, longitude: _in[i]['$'].lon };
        let pathLength = getPathLength([ startLoc, endLoc ]);
        let bearing = getRhumbLineBearing(startLoc, endLoc);
        let loops = Math.floor(span / secondsBetweenPoints);
        let pathLoopLength = Math.floor(pathLength/loops);
        let eleLoopHeight = (endEle - startEle)/loops;
        for (l = 1; l <= loops; l++) {
            let t = new Date(startTime.getTime() + 1000 * l * secondsBetweenPoints);
            let now = JSON.parse(JSON.stringify(_in[i-1]));
            let coord = computeDestinationPoint(
                startLoc,
                pathLoopLength * l,
                bearing
            );
            now['$'].lat = coord.latitude;
            now['$'].lon = coord.longitude;
            now.ele = startEle + (eleLoopHeight * l);
            now.time = `${t.toISOString()}`;
            _out.push(now);
        }
        // }
        _out.push(_in[i]);
    }
    return _out;
}

async function main() {
    var parser = new xml2js.Parser();
    let data = await fs.readFileSync(process.argv[2]);
    let gpxxml;
    await parser.parseString(data, function (err, result) {
        gpxxml = result;
    });

    gpxxml.gpx.trk[0].name = path.basename(process.argv[2], path.extname(process.argv[2]));
    gpxxml.gpx.trk[0].type = [process.argv[3]];
    
    let totalDistance = 0;
    let lastLat, lastLon;
    for await (trkpt of gpxxml.gpx.trk[0].trkseg[0].trkpt) {
        if (lastLat) {
            const distance = getDistance(
                { latitude: lastLat, longitude: lastLon },
                { latitude: trkpt['$'].lat, longitude: trkpt['$'].lon }
            );
            totalDistance += distance;
        }
        lastLat = trkpt['$'].lat;
        lastLon = trkpt['$'].lon;
    }

    let start = new Date(process.argv[4]);
    const end = new Date(process.argv[5]);
    const seconds = (end - start) / 1000;
    const secondsPerDistance = seconds / totalDistance;

    console.log(`Total distance: ${totalDistance}`)
    console.log(`Total seconds: ${seconds}`)
    console.log(`Seconds per distant: ${secondsPerDistance}`)

    lastLat = null;
    lastLon = null;
    for await (trkpt of gpxxml.gpx.trk[0].trkseg[0].trkpt) {
        if (lastLat) {
            const distance = getDistance(
                { latitude: lastLat, longitude: lastLon },
                { latitude: trkpt['$'].lat, longitude: trkpt['$'].lon }
            );
            start = new Date(start.getTime() + 1000 * secondsPerDistance * distance);
        }
        trkpt.time = `${start.toISOString()}`;
        lastLat = trkpt['$'].lat;
        lastLon = trkpt['$'].lon;
    }

    //gpxxml.gpx.trk[0].trkseg[0].trkpt = await addPoints(gpxxml.gpx.trk[0].trkseg[0].trkpt);

    var builder = new xml2js.Builder();
    var xml = builder.buildObject(gpxxml);
    await fs.writeFileSync(`${process.argv[2]}2.gpx`, xml);
}

main()