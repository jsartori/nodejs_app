const https = require('https')

/**
 * Performs a given operation and returns the result
 * @param {d} JSON object containing trhee properties: the "operation" and the operands "left" and "right" 
 * @returns result (number)
 */
function executeCalculation(d) {
    let result = null;
    
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

/**
 * Sends back the result of the task with its ID to the ADP endpoint
 * @param id ID of the given task to solve
 * @param result the result of the operation
 */
function sendAnswer(id, result) {
    // we stringify the JSON object to send it to the POST endpoint
    const data = JSON.stringify({
        id: id,
        result: result
    })

    // just declaring the options for the POST request
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

    // depending on the status code whe show different messages to the user
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

        // if 'data' we start another task or prompt the user again depending if the AUTO mode is ON or not
        res.on('data', d => {
            process.stdout.write(d);
            if (autoMode)
                getTaskSubmitAnswer();
            else
                readAnotherLine();
        })
    });

    // at this phase, if an error occurs we just try sending other task if in AUTO mode
    // or prompts the user again if not in AUTO mode
    req.on('error', error => {
        console.error(error);
        if (autoMode)
            getTaskSubmitAnswer();
        else
            readAnotherLine();
    });

    req.write(data);
    req.end();
}

/**
 * This function makes a GET request to ADP endpoint in orde to receive a task and an operation to execute.
 * After executing the proper calculations, it send the result to another ADP endpoint via POST  to proccess the result.
 */
function getTaskSubmitAnswer() {
    const req = https.request({
        hostname: 'interview.adpeai.com',
        port: 443,
        path: '/api/v1/get-task',
        method: 'GET'
    }, res => {
        console.log(`statusCode: ${res.statusCode}`)
        let rawData = '';

        // keeps chunking data 
        res.on('data', (chunk) => (rawData += chunk));
        
        // when data finishes coming from the server...
        res.on('end', () => {
            // ...we turn it into a JSON object
            let data = JSON.parse(rawData);
            // and calculate!  
            let result = executeCalculation(data);
            console.log('result', result);
            // then we submit the result
            sendAnswer(data.id, result);
        });
    })

    // in case of error whe getting a task, prompts the user again
    req.on('error', error => {
        console.error(error);
        readAnotherLine();
    })

    req.end();
}

// when autMode is true it makes de the application perform continuous operations
var autoMode = false;

// just creating the readLine object to read user's parameters and output visual feedback
const readline = require('readline').createInterface({
    input: process.stdin,
    output: process.stdout
})

/**
 * The main function of the application which displays a prompt for the user.
 * If the user presses 'Y' the app will perform a single getTaskSubmitAnswer operation.
 * In case the user presses 'N' the app will quit running.
 * If the user sends 'AUTO' as a parameter, the app will start getting and submitng tasks continuously. 
 */
var readAnotherLine = function () {
    readline.question(`Get another task and send answer? (Y, N or AUTO for automatic mode): `, command => {
        if (command === 'Y' || command === 'y') {
            // call a single task
            getTaskSubmitAnswer();
        }
        else if (command === 'N' || command === 'n') {
            // closes the application and stop reading the keys
            console.log(`Closing application...`);
            readline.close();
        } else if (command === 'AUTO') {
            // turns AUTO mode on and starts tasks automatically (non-stopping)
            console.log(`AUTO mode ON...`);
            autoMode = true;
            getTaskSubmitAnswer();
        } else {
            // if user pressed other keys or words, ignore and ask again for a new line
            console.log('Wrong command. Expected Y or N!');
            readAnotherLine();
        }
    })
};

// this line starts the application by calling it's main fucntion
readAnotherLine();

module.exports = { executeCalculation };