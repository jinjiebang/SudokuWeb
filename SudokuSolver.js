var SudokuSolver = function () {
    this.init()
}
SudokuSolver.prototype.init = function () {
    this.InBlock = [];
    this.InRow = [];
    this.InCol = [];

    //初始化用到的索引
    var i, j, Square;
    for (i = 0; i < 9; i++) {
        for (j = 0; j < 9; j++) {
            Square = 9 * i + j;
            this.InRow[Square] = i;  //索引方块在的行数
            this.InCol[Square] = j;  //索引方块在的列数
            this.InBlock[Square] = Math.floor(i / 3) * 3 + Math.floor(j / 3); //索引方块在第几个小九宫格
        }
    }
    this.BLANK = 0;
}
SudokuSolver.prototype.setData = function (data) {
    this.data = data
    //初始化序列，内容和递归次数
    this.SeqPtr = 0
    this.Count = 0
    // 已填数的队列
    this.Sequence = [];
    this.Entry = [];
    this.LevelCount = [];
    var Square;
    for (Square = 0; Square < 81; Square++) {
        this.Sequence[Square] = Square;
        this.Entry[Square] = this.BLANK;
        this.LevelCount[Square] = 0;
    }

    //初始化九宫格，行，列的填数情况，对应位为1，表示需要填数
    this.ONES = parseInt("3fe", 16); // Binary 1111111110
    console.log(this.ONES)
    this.Block = [];
    this.Row = [];
    this.Col = [];
    for (i = 0; i < 9; i++) {
        this.Block[i] = this.Row[i] = this.Col[i] = this.ONES;
    }
    this.inputData()
}
SudokuSolver.prototype.solve = function () {
    this.results = [];
    //从队列中的第一个空位开始
    // console.log('this.SeqPtr:', this.SeqPtr)
    this.Place(this.SeqPtr);
    return this.results;
}
SudokuSolver.prototype.inputData = function () {
    var i, j;

    for (i = 0; i < 9; i++) {
        for (j = 0; j < 9; j++) {
            if (this.data[i][j] != 0) {
                this.InitEntry(i, j, this.data[i][j])
            }
        }
    }

}
SudokuSolver.prototype.InitEntry = function (i, j, val) {
    var Square = 9 * i + j;
    var valbit = 1 << val;
    var SeqPtr2;

    // console.log('InitEntry', val, valbit);
    // 填入内容
    this.Entry[Square] = valbit;
    this.Block[this.InBlock[Square]] &= ~valbit;
    this.Col[j] &= ~valbit;
    this.Row[i] &= ~valbit;

    //找到在队列的位置
    SeqPtr2 = this.SeqPtr;
    while (SeqPtr2 < 81 && this.Sequence[SeqPtr2] != Square)
        SeqPtr2++;

    //和第一个空位，交换位置
    this.SwapSeqEntries(this.SeqPtr, SeqPtr2);
    this.SeqPtr++;
}
//交换在队列中的位置
SudokuSolver.prototype.SwapSeqEntries = function (S1, S2) {
    var temp = this.Sequence[S2];
    this.Sequence[S2] = this.Sequence[S1];
    this.Sequence[S1] = temp;
}
SudokuSolver.prototype.Succeed = function () {
    console.log("填数成功")
    this.SaveResult()
}
// 开始填数
SudokuSolver.prototype.Place = function (S) {

    if (S >= 81) {
        this.Succeed();
        return;
    }
    this.LevelCount[S]++;
    this.Count++;
    // console.log('------------Seq:', S);

    //找可填数字最少的空位
    var S2 = this.NextSeq(S);
    this.SwapSeqEntries(S, S2);

    var Square = this.Sequence[S];

    var BlockIndex = this.InBlock[Square],
        RowIndex = this.InRow[Square],
        ColIndex = this.InCol[Square];
    // console.log('Place Square:', Square, 'row：', RowIndex, 'col:', ColIndex);



    //一个数字，对应位为1时，代表可以填数该数字，比如 100 表示可以填入2 110可以填入1和2
    var Possibles = this.Block[BlockIndex] & this.Row[RowIndex] & this.Col[ColIndex];
    // console.log('val three:',this.Block[BlockIndex] ,this.Row[RowIndex] , this.Col[ColIndex])
    // 当可以继续填的时候，不断填数字
    // this.getPossibles(Possibles)
    while (Possibles) {
        var valbit = Possibles & (-Possibles); // Lowest 1 bit in Possibles
        Possibles &= ~valbit;

        // console.log('place num:', this.getNum(valbit))
        //填入一个可能的数字
        this.Entry[Square] = valbit;
        this.Block[BlockIndex] &= ~valbit;
        this.Row[RowIndex] &= ~valbit;
        this.Col[ColIndex] &= ~valbit;


        //递归填入下一个数字
        this.Place(S + 1);

        // console.log('------------cancel Seq:', S);
        // console.log('cancel num', this.getNum(valbit))
        // this.getPossibles(Possibles)
        //撤销填入
        this.Entry[Square] = this.BLANK; // Could be moved out of the loop
        this.Block[BlockIndex] |= valbit;
        this.Row[RowIndex] |= valbit;
        this.Col[ColIndex] |= valbit;
    }

    this.SwapSeqEntries(S, S2);
}
SudokuSolver.prototype.getPossibles = function (Possibles) {
    var allNum = []
    while (Possibles) {
        var valbit = Possibles & (-Possibles);
        Possibles &= ~valbit;
        allNum.push(this.getNum(valbit))
    }
    console.log('allnum:', allNum);
}
SudokuSolver.prototype.getNum = function (valbit) {
    for (var val = 1; val <= 9; val++) {
        if (valbit == (1 << val)) {
            return val;
        }
    }
    return 0;
}
// 在序列中，找可以填入的数字最少的空位
SudokuSolver.prototype.NextSeq = function (S) {
    var S2, Square, Possibles, BitCount;
    var T, MinBitCount = 100;

    for (T = S; T < 81; T++) {
        Square = this.Sequence[T];
        Possibles = this.Block[this.InBlock[Square]] & this.Row[this.InRow[Square]] & this.Col[this.InCol[Square]];
        //这个位置可能填的有多少个数
        BitCount = 0;

        while (Possibles) {
            Possibles &= ~(Possibles & -Possibles);
            BitCount++;
        }
        //记录可能性最少的位置
        if (BitCount < MinBitCount) {
            MinBitCount = BitCount;
            S2 = T;
        }
    }

    return S2;
}
SudokuSolver.prototype.SaveResult = function () {
    var i, j, valbit;
    var Square = 0;
    var oneResult = []

    for (i = 0; i < 9; i++) {
        oneResult[i] = [];
        for (j = 0; j < 9; j++) {
            valbit = this.Entry[Square++];
            if (valbit == 0) oneResult[i][j] = 0;
            else oneResult[i][j] = this.getNum(valbit)
        }
    }
    this.results.push(oneResult)
}
