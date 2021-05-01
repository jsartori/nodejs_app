const https = require('https')

function executeCalculation(d) {
    let result = null;
    console.log(d);

    if (d.operation == 'addition') {
        result = d.left + d.right;
    }
    else if (d.operation == 'subtraction') {
        result = d.left - d.right;
    }
    else if (d.operation == 'multiplication') {
        result = d.left * d.right;
    }
    else if (d.operation === 'division') {
        result = d.left / d.right;
    }
    else if (d.operation === 'remainder') {
        result = d.left % d.right;
    }

    return result;
}

function sendAnswer(id, result) {
    const data = JSON.stringify({
        id: id,
        result: result
    })

    const options = {
        hostname: 'interview.adpeai.com',
        port: 443,
        path: '/api/v1/submit-task',
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Content-Length': data.length
        }
    }

    const req = https.request(options, res => {
        console.log(`statusCode: ${res.statusCode}`)
        switch (res.statusCode) {
            case 200:
                console.log(`Success`);
                break;
        
            case 400:
                console.error('Request Failed.\nIncorrect value in result; no ID specified; value is invalid');
				break;
            
            case 404:
                console.error('Request Failed.\nValue not found for specified ID');
                break;
            
            case 503:
                console.error('Request Failed.\nError communicating with database');
                break;
                
            default:
                console.error('Somehting else happened!');
                break;
        } 

        res.on('data', d => {
            process.stdout.write(d);
        })
    });

    req.on('error', error => {
        console.error(error);
    });

    req.write(data);
    req.end();
}

//main commands start here...
const req = https.request({
    hostname: 'interview.adpeai.com',
    port: 443,
    path: '/api/v1/get-task',
    method: 'GET'
}, res => {

    console.log(`statusCode: ${res.statusCode}`)

    let rawData = '';
    res.on('data', (chunk) => (rawData += chunk));
    res.on('end', () => {
        let data = JSON.parse(rawData);
        let result = executeCalculation(data);
        console.log('result', result);

        sendAnswer(data.id, result);
    });
})

req.on('error', error => {
    console.error(error)
})

req.end();