const Discord = require('discord.js'); //we're connecting the discord api to this file
const config = require('./config.json');
const bot = new Discord.Client(); //we're creating our bot here

//login info has to be in project to allow it to log into our bot
// requires a token (password to the bot)
// if anyone gets access to the token, they can edit, turn on, turn off, mess with the bot




const PREFIX = '!'; //this is to indicate to the bot when a message is a command for the bot

const calledMeet = new Set(); //used to be a map, need to figure out how to add timerID to map before setTimeout() begins
//maps authorID to timerID

var cancelled = 0;

var notifyList;



bot.login(config.token);

//below is an arrow function, an arrow function is just an easier way to create a function

bot.on('ready', () =>{
    console.log('This bot is online!');
    bot.user.setActivity('hardstuck', {
        type: 'FOREVER'
    }) .catch(console.error);
})

var timerID;
//let vs const:
// const = a signal that the identifier wont be reassigned (so a const variable will not change)
// let   = a signal that the variable MAY be reassigned and will only be used in the block it's defined in
bot.on('message', message=>{
    
    let args = message.content.substring(PREFIX.length).split(" ");
    //this allows us to implement the prefix at the beginning of our arguments

    switch(args[0]){ //args[0], the first word after prefix is gonna be args[0], so this will be helpful if u have multiple commands (e.g !kick, !ping, !vote, etc)

        case 'ping':
            message.channel.send('pong!');
            break;
        case 'help':
            message.channel.send('!meet [minutes], react to the message to be notified!')
        case 'cancel':
            if (calledMeet.has(message.author.id)){
                clearTimeout(timerID);
                calledMeet.delete(message.author.id);
                message.reply('your meetup has been cancelled')
                cancelled = 1;
            } else {
                message.channel.send('No previous meetup to cancel!');
            }
        case 'meet':

            var time = parseInt(args[1]);
            var timeToTicks = 0;
            notifyList = new Set();
            var unitOfTime;
        
            if (args[1] != ""){

                if (args[2] == "minutes" || args[2] == "minute" || args[2] == "mins" || args[2] == "min"){
                unitOfTime = 'minute(s)'
                timeToTicks = 60*1000*time;
               } else if (args[2] == "hour" || args[2] == "hours" || args[2] == "hrs" || args[2] == "hr"){
                unitOfTime = 'hour(s)'
                timeToTicks = 60*1000*time*60;
                } else if (args[2] == "seconds" || args[2] == "second" || args[2] == "sec" || args[2] == "secs"){
                unitOfTime = 'second(s)'
                timeToTicks = 1000*time;
                } else {
                    unitOfTime = 'minute(s)';
                    timetoTicks = 60*1000*time;
                }
                if (cancelled == 0){
                message.channel.send('I\'ll remind you to meet in ' + time + ' ' + unitOfTime + '\n' + '\n' + 'Click the ' + '👍' + ' to be notified when it is time to play!');
                message.react('👍');
                
                // message.awaitReactions(filter, {max: 20, time: timeToTicks, errors: ['time'] })
                
                calledMeet.add(message.author.id);
                }

                // client.on('messageReactionAdd', (reaction, user) => {
                //     if(reaction.emoji.name === '👍') {
                //     notifyList.add(reaction.users);
                // }
                // })
                
                const filter = (reaction, user) => {
                    return reaction.emoji.name === '👍' && user.id != 734990963054870581 
                    && user.id != message.author.id;
                };

                const collector = message.createReactionCollector(filter, {time: timeToTicks});

                collector.on('collect', (reaction,user) => {
                    notifyList.add(user.id);
 
                })
            
                timerID = setTimeout(() => {

                    if (cancelled == 0){
                        
                        

                        notifyList = Array.from(notifyList);
                        
                        

                        var i;

                        var replyString = '';

                        if (notifyList.length > 0){

                            for (i = 0; i < notifyList.length; i ++){
                                replyString +=  '<@' + notifyList[i] + '>' ;
                            }

                            message.reply(replyString + ', it\'s time to play!');
                        } else {

                        message.reply('it\'s time to play!');
                        }
                    } 
                    
                    notifyList = new Set();
                    cancelled = 0;
                
                }, timeToTicks)
            
            } else {
                message.channel.send('Invalid Args')
            }

        
    }
    
})




//MAKING COMMANDS

//we must come up with a prefix, its something to indicate that a message is a command for a bot, its typically "!"
