import 'dart:async';
import 'dart:math';
import 'package:flutter/gestures.dart';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:url_launcher/url_launcher.dart';

void main() {
  runApp(const MyApp());
}

class MyApp extends StatelessWidget {
  const MyApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Flutter Tetris',
      theme: ThemeData(
        primarySwatch: Colors.blue,
      ),
      home: const Tetris(),
    );
  }
}

class Tetris extends StatefulWidget {
  const Tetris({super.key});

  @override
  TetrisState createState() => TetrisState();
}

class TetrisState extends State<Tetris> {
  static const int boardWidth = 10;
  static const int boardHeight = 20;
  static const double cellSize = 30.0;

  late List<List<bool>> board;
  late Tetrimino currentTetrimino;
  late Position position;
  late Timer timer;
  int lines = 0;

  @override
  void initState() {
    super.initState();
    startGame();
  }

  @override
  Widget build(BuildContext context) {
    return KeyboardListener(
      focusNode: FocusNode()..requestFocus(),
      onKeyEvent: (KeyEvent event) {
        if (event is KeyDownEvent || event is KeyRepeatEvent) {
          switch (event.logicalKey.keyLabel) {
            case 'Arrow Left':
              moveLeft();
              break;
            case 'Arrow Right':
              moveRight();
              break;
            case 'Arrow Down':
              moveDown();
              break;
            case 'Arrow Up':
              rotate();
              break;
          }
        }
      },
      child: Scaffold(
        appBar: AppBar(
          title: RichText(
            text: TextSpan(
              children: [
                const TextSpan(
                  text: 'Flutter Tetris: ',
                  style: TextStyle(color: Colors.black),
                ),
                TextSpan(
                  text: 'GitHub',
                  style: const TextStyle(
                    color: Colors.blue,
                    decoration: TextDecoration.underline,
                  ),
                  recognizer: TapGestureRecognizer()..onTap = launchURL,
                ),
              ],
            ),
          ),
        ),
        body: Center(
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              SizedBox(
                width: boardWidth * cellSize,
                height: boardHeight * cellSize,
                child: GridView.builder(
                  physics: const NeverScrollableScrollPhysics(),
                  gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                    crossAxisCount: boardWidth,
                    childAspectRatio: 1.0,
                  ),
                  itemCount: boardWidth * boardHeight,
                  itemBuilder: (context, index) {
                    int x = index % boardWidth;
                    int y = index ~/ boardWidth;
                    bool isTetriminoCell = currentTetrimino.shape.any((point) =>
                        point.x + position.x == x && point.y + position.y == y);
                    bool isFilled = board[y][x] || isTetriminoCell;
                    return Container(
                      decoration: BoxDecoration(
                        color: isFilled ? Colors.grey : Colors.white,
                        border: Border.all(color: Colors.black, width: 0.1),
                      ),
                    );
                  },
                ),
              ),
              Text(
                'Lines: $lines',
                style: const TextStyle(fontSize: 20),
              ),
            ],
          ),
        ),
      ),
    );
  }

  void startGame() {
    board = List.generate(
        boardHeight, (_) => List.generate(boardWidth, (_) => false));
    currentTetrimino = Tetrimino.random();
    position = Position(4, 0);
    lines = 0;
    timer =
        Timer.periodic(const Duration(milliseconds: 500), (_) => moveDown());
  }

  void moveDown() {
    setState(() {
      position = Position(position.x, position.y + 1);
      if (isCollision()) {
        position = Position(position.x, position.y - 1);
        fixTetrimino();
        eraseLines();
        currentTetrimino = Tetrimino.random();
        position = Position(4, 0);
        if (isCollision()) {
          timer.cancel();
          startGame();
        }
      }
    });
  }

  void moveLeft() {
    setState(() {
      position = Position(position.x - 1, position.y);
      if (isCollision()) {
        position = Position(position.x + 1, position.y);
      }
    });
  }

  void moveRight() {
    setState(() {
      position = Position(position.x + 1, position.y);
      if (isCollision()) {
        position = Position(position.x - 1, position.y);
      }
    });
  }

  void rotate() {
    setState(() {
      currentTetrimino.rotate();
      if (isCollision()) {
        currentTetrimino.rotateBack();
      }
    });
  }

  bool isCollision() {
    for (var point in currentTetrimino.shape) {
      int x = position.x + point.x;
      int y = position.y + point.y;
      if (x < 0 ||
          x >= boardWidth ||
          y >= boardHeight ||
          (y >= 0 && board[y][x])) {
        return true;
      }
    }
    return false;
  }

  void fixTetrimino() {
    for (var point in currentTetrimino.shape) {
      int x = position.x + point.x;
      int y = position.y + point.y;
      if (y >= 0) {
        board[y][x] = true;
      }
    }
  }

  void eraseLines() {
    setState(() {
      int linesBefore = board.length;
      board.removeWhere((row) => row.every((cell) => cell));
      int linesAfter = board.length;
      int linesCleared = linesBefore - linesAfter;
      lines += linesCleared;
      for (int i = 0; i < linesCleared; i++) {
        board.insert(0, List.generate(boardWidth, (index) => false));
      }
    });
  }

  Future<void> launchURL() async {
    final Uri url =
        Uri.parse('https://github.com/satosystems/tetris/tree/main/flutter');
    if (await canLaunchUrl(url)) {
      await launchUrl(url);
    } else {
      throw Exception('Could not launch $url');
    }
  }
}

class Position {
  final int x, y;
  Position(this.x, this.y);
}

class Tetrimino {
  List<Position> shape;
  Tetrimino(this.shape);

  factory Tetrimino.random() {
    final shapes = [
      Tetrimino([
        Position(0, 0),
        Position(0, 1),
        Position(0, 2),
        Position(0, 3)
      ]), // I
      Tetrimino([
        Position(0, 0),
        Position(1, 0),
        Position(0, 1),
        Position(1, 1)
      ]), // O
      Tetrimino([
        Position(0, 0),
        Position(-1, 0),
        Position(1, 0),
        Position(0, 1)
      ]), // T
      Tetrimino([
        Position(0, 0),
        Position(-1, 0),
        Position(0, 1),
        Position(1, 1)
      ]), // S
      Tetrimino([
        Position(0, 0),
        Position(1, 0),
        Position(0, 1),
        Position(-1, 1)
      ]), // Z
      Tetrimino([
        Position(0, 0),
        Position(-1, 0),
        Position(0, 1),
        Position(0, 2)
      ]), // J
      Tetrimino([
        Position(0, 0),
        Position(1, 0),
        Position(0, 1),
        Position(0, 2)
      ]), // L
    ];
    final random = Random();
    return shapes[random.nextInt(shapes.length)];
  }

  void rotate() {
    shape = shape.map((point) => Position(-point.y, point.x)).toList();
  }

  void rotateBack() {
    shape = shape.map((point) => Position(point.y, -point.x)).toList();
  }
}
