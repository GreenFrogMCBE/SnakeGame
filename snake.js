const Frog = require('../../src/Frog');

const DarkOakLog = require('../../src/block/DarkOakLog');
const SmoothQuartzBlock = require('../../src/block/SmoothQuartzBlock');

module.exports = {
  onLoad() {
    let isRunning = false

    Frog.eventEmitter.on('playerChat', event => {
      const { player, message } = event;

      if (message === 'start') {
        // Cancel the event, so the message won't show up to other players in chat
        event.cancel()

        if (isRunning) {
          player.sendMessage("§cSnake is already running!")
          return
        }

        player.sendMessage('§aSnake game started by: ' + player.username);

        isRunning = true

        // Place starting block and teleport player to the top
        const { x, y, z } = player.location;
        const posY = Math.floor(y);

        player.teleport(x, posY + 10, z);
        player.world.placeBlock(Math.floor(x), posY + 1, Math.floor(z), new DarkOakLog().getRuntimeID());

        // Set up interval for moving snake blocks
        let snakeBlockIndex = 0; // index for the snake block currently being moved

        const snakeMoveInterval = setInterval(() => {
          snakeBlockIndex++;

          player.world.placeBlock(Math.floor(x) - (snakeBlockIndex + 1), posY + 1, Math.floor(z), new DarkOakLog().getRuntimeID());
          player.world.breakBlock(Math.floor(x) - snakeBlockIndex, posY + 1, Math.floor(z));
          player.world.breakBlock(Math.floor(x), posY + 1, Math.floor(z));
        }, 1000);

        // Place surrounding blocks
        for (let i = -8; i <= 8; i++) {
          for (let j = -8; j <= 8; j++) {
            const posX = Math.floor(x + i);
            const posZ = Math.floor(z + j);

            player.world.placeBlock(posX, posY, posZ, new SmoothQuartzBlock().getRuntimeID());
          }
        }

        // Clean up after game ends
        setTimeout(() => {
          clearInterval(snakeMoveInterval);
          player.world.breakBlock(Math.floor(x) - (snakeBlockIndex + 1), posY + 1, Math.floor(z), new DarkOakLog().getRuntimeID());

          for (let i = -8; i <= 8; i++) {
            for (let j = -8; j <= 8; j++) {
              const posX = Math.floor(x + i);
              const posZ = Math.floor(z + j);

              player.world.breakBlock(posX, posY, posZ);
            }
          }

          isRunning = false

          player.sendMessage('§cGame over!');
        }, 30000);
      }
    });
  },
};
