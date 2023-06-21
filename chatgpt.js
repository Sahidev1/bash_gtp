const { Configuration, OpenAIApi } = require("openai");
require('dotenv').config({
    path: require('path').resolve(__dirname, './.env')
});  
const { stdoutDataStreamFilter } = require("./util");
const { readConfig } = require("./filehandler");

const jsonConfig = readConfig();

if (!process.env.OPENAI_API_KEY && !jsonConfig.OPENAI_API_KEY){
    console.log('No OPEN_API_KEY detected, rub bashgpt with -k parameter with your openai key to set keys or change keys');
    process.exit(1);
}

const config = new Configuration({
    apiKey: process.env.OPENAI_API_KEY || jsonConfig.OPENAI_API_KEY,
});

const openai = new OpenAIApi(config);

//valid roles for prompt: user and system
const prompt = async (messages) => {
    try {
        const completion = await openai.createChatCompletion({
            model: "gpt-3.5-turbo",
            messages: messages,
            stream:true,
        }, { responseType: 'stream'});
        console.log(`MESSAGE:\n`);
        let accumData = "";

        return new Promise((resolve, reject) => {
            completion.data.on('data', (data) => {
                let content = stdoutDataStreamFilter(data);
                accumData = accumData.concat(content);
            });
            completion.data.on('end', () => {
                resolve(accumData);
            });
            completion.data.on('error', (err) => {
                reject(err);
            });
        });

    } catch (error) {
        console.error('If your openai key doesnt work and you want to change it use bashgpt with -k option along with new openai key to change it', error);
    }
}

module.exports = prompt;