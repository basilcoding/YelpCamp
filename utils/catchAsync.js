module.exports = (func) => {
    return (req, res, next) => { // this function gets automatically called
        func(req, res, next).catch(next); //automatically called function calls func
    }
}