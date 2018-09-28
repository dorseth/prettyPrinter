const fs       = require('fs');
const signale  = require('signale');
const chalk    = require('chalk');
const mkpath   = require('mkpath');
const { dump } = require('dumper.js');



const settings = {
    data: {
        dump_folder: '.dump',
        signale    : {
            displayFilename : false,
            displayTimestamp: true,
            displayDate     : false
        }
    },
    get(key){
        return this.data[key];
    },
    set(obj){
        Object.assign(this.data, obj);
        signale.config({
            ...this.data.signale
        }); 
    }
};

if (!fs.existsSync(settings.data.dump_folder)){
    fs.mkdirSync(settings.data.dump_folder);
}

signale.config({
    ...settings.data.signale
}); 
// current date
const time_str = () => {
    var time = new Date();
    return `${time.getHours()}:${time.getMinutes()}:${time.getSeconds()}`;
};

// recursive print
const print = (str, ...args) => {
  
    if(str){
        if(str === 'dump'){
            dump(...args);
        }
        else if(signale[str]){
            signale[str](...args);
        } else {
            console.log(chalk.gray(`[${time_str()}]`) , str, ...args);
        } 
    }
    return (trace)=> {
        if(trace){
            console.trace(trace);
        }
        return (file_name, file_content, file_check, enc="utf8")=>{
            if(file_name){
                let final;
                if(typeof file_content === 'object'){
                    final = JSON.stringify(file_content, null, 4);
                } else{
                    final = file_content;
                }
                const re = (file_name) => {
                    let arr   = file_name.split('');
                    let nums  = arr.filter(x => !isNaN(parseInt(x))).join('');
                    let other = arr.filter(x => isNaN(parseInt(x))).join('');
                    if(!nums.length){
                        nums = 0;
                    }
                    let n = parseInt(nums)+1;
                    file_name = other.replace(/(\.[\w\d_-]+)$/i, `${n}$1`);
                    console.log(file_name);
                    if(fs.existsSync(file_name)){
                        return re(file_name);
                    } else {
                        return file_name;
                    }
                };
                if (file_check && fs.existsSync(file_name)) {
                    file_name = re(file_name);
                } 
                let directory_path = file_name.split('/'); 
                if(directory_path.length > 1){
                    directory_path.splice(-1,1);
                    directory_path = directory_path.join('/');
    
                    mkpath.sync(`${settings.data.dump_folder}/${directory_path}`);
                }

                fs.writeFileSync(`${settings.data.dump_folder}/${file_name}`, final, { encoding: enc});
                signale.success('file saved to', `.dump/${file_name}`);
            }
            return print;
        }; 
    };
};

// print('success', 'hello world')()('file.json', {'hello': 'world1'}, true)('success', 'goodbye world')()()('error', 'end');
global.print = print;

module.exports = settings.set;