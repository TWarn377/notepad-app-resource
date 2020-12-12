'use-strict';

module.exports = {
    manyToManyDelta: function (arr, dbArr, dbFieldName) {
        const add = [], del = [];

        arr.forEach(item => {
            if (dbArr.indexOf(item) == -1) {
                add.push(item);
            }
        });

        dbArr.forEach(item => {
            if (arr.indexOf(item) == -1) {
                del.push(item);
            }
        });

        return { add: add, del: del };
    },
    jsToSQLDate: function (jsDate) {
        try {
            console.log(jsDate);
            if (jsDate) {
                const date = new Date(jsDate);
                const day = date.getDate();
                const month = date.getMonth();
                const year = date.getFullYear();
                const hours = date.getHours();
                const minutes = date.getMinutes();
                const seconds = date.getSeconds();

                return `${year}-${month}-${day} ${hours}:${minutes}.${seconds}.000`;
            } else {
                return null;
            }
        } catch (err) {
            console.error('Error Formatting date');
            console.error(err);
            throw err;
        }
    }
};