import { GAME_WIDTH, GAME_HEIGHT, COLORS } from './constants';
import type { GameState } from './types';

export function render(ctx: CanvasRenderingContext2D, state: GameState): void {
  ctx.fillStyle = COLORS.bg;
  ctx.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);

  drawCenterNet(ctx);

  drawScore(ctx, state.score.left, state.score.right);

  drawPaddle(ctx, state.leftPaddle.x, state.leftPaddle.y, state.leftPaddle.width, state.leftPaddle.height);
  drawPaddle(ctx, state.rightPaddle.x, state.rightPaddle.y, state.rightPaddle.width, state.rightPaddle.height);

  if (state.status !== 'finished') {
    drawBall(ctx, state.ball.x, state.ball.y, state.ball.size);
  }

  if (state.status === 'idle') {
    drawOverlay(ctx, 'PRESS SPACE TO START');
  } else if (state.status === 'paused') {
    drawOverlay(ctx, 'PAUSED');
  } else if (state.status === 'finished' && state.winner) {
    const winnerText = state.winner === 'left' ? 'LEFT PLAYER WINS' : 'RIGHT PLAYER WINS';
    drawOverlay(ctx, winnerText, 'PRESS SPACE TO PLAY AGAIN');
  }
}

function drawCenterNet(ctx: CanvasRenderingContext2D): void {
  ctx.strokeStyle = COLORS.net;
  ctx.lineWidth = 2;
  ctx.setLineDash([10, 10]);
  ctx.beginPath();
  ctx.moveTo(GAME_WIDTH / 2, 0);
  ctx.lineTo(GAME_WIDTH / 2, GAME_HEIGHT);
  ctx.stroke();
  ctx.setLineDash([]);
}

function drawPaddle(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number): void {
  ctx.shadowColor = COLORS.glow;
  ctx.shadowBlur = 15;
  ctx.fillStyle = COLORS.fg;
  ctx.fillRect(x, y, w, h);
  ctx.shadowBlur = 0;
}

function drawBall(ctx: CanvasRenderingContext2D, x: number, y: number, size: number): void {
  ctx.shadowColor = COLORS.glow;
  ctx.shadowBlur = 20;
  ctx.fillStyle = COLORS.fg;
  ctx.fillRect(x - size / 2, y - size / 2, size, size);
  ctx.shadowBlur = 0;
}

function drawScore(ctx: CanvasRenderingContext2D, left: number, right: number): void {
  ctx.fillStyle = COLORS.fg;
  ctx.font = 'bold 60px "Press Start 2P", monospace';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'top';
  ctx.shadowColor = COLORS.glow;
  ctx.shadowBlur = 10;
  ctx.fillText(String(left), GAME_WIDTH / 4, 40);
  ctx.fillText(String(right), (GAME_WIDTH * 3) / 4, 40);
  ctx.shadowBlur = 0;
}

function drawOverlay(ctx: CanvasRenderingContext2D, mainText: string, subText?: string): void {
  ctx.fillStyle = 'rgba(10, 10, 15, 0.75)';
  ctx.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);

  ctx.fillStyle = COLORS.fg;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.shadowColor = COLORS.glow;
  ctx.shadowBlur = 15;

  ctx.font = 'bold 24px "Press Start 2P", monospace';
  ctx.fillText(mainText, GAME_WIDTH / 2, GAME_HEIGHT / 2);

  if (subText) {
    ctx.font = 'bold 12px "Press Start 2P", monospace';
    ctx.fillText(subText, GAME_WIDTH / 2, GAME_HEIGHT / 2 + 50);
  }
  ctx.shadowBlur = 0;
}