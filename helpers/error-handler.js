'use-script';

 const functions = {
    toError: function(message, code) {
        try {
            if (typeof message !== 'string' && typeof code !== 'number') {
                console.error(`ERROR: Message: [${message}] | Code: [${code}]`);
                throw new Error( { message: `Error converting error to error object: MESSAGE - ${message}`, code: 501 });
            }

            return { message: message, code: code };
        } catch (err) {
            throw new Error(functions.toError(err, 500));
        }
    } 
}

module.exports = functions;