const ytdl = require('@distube/ytdl-core');
async function test() {
  try {
    const info = await ytdl.getInfo('https://www.youtube.com/watch?v=dQw4w9WgXcQ');
    const format = ytdl.chooseFormat(info.formats, { filter: 'audioandvideo' });
    console.log("Format URL:", format.url ? "Success" : "Failed");
  } catch(e) {
    console.error(e.message);
  }
}
test();
