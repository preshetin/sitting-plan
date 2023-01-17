import axios from "axios";
import * as React from "react";
import { createRoot } from "react-dom/client";
import sampleStudents from "./sampleStudents.txt?raw";

const languages = [
  {
    code: "en",
    name: "Английский (English)",
  },
  {
    code: "de",
    name: "🇩🇪 German (Deutch)",
  },
  {
    code: "hi",
    name: "🇮🇳 Hindi",
  },
];

function transliterate(word: any): string{
    let answer = ""
    let a: any = {};

   a["Ё"]="Yo";a["Й"]="I";a["Ц"]="Ts";a["У"]="U";a["К"]="K";a["Е"]="E";a["Н"]="N";a["Г"]="G";a["Ш"]="Sh";a["Щ"]="Sch";a["З"]="Z";a["Х"]="H";a["Ъ"]="'";
   a["ё"]="yo";a["й"]="i";a["ц"]="ts";a["у"]="u";a["к"]="k";a["е"]="e";a["н"]="n";a["г"]="g";a["ш"]="sh";a["щ"]="sch";a["з"]="z";a["х"]="h";a["ъ"]="'";
   a["Ф"]="F";a["Ы"]="I";a["В"]="V";a["А"]="А";a["П"]="P";a["Р"]="R";a["О"]="O";a["Л"]="L";a["Д"]="D";a["Ж"]="Zh";a["Э"]="E";
   a["ф"]="f";a["ы"]="i";a["в"]="v";a["а"]="a";a["п"]="p";a["р"]="r";a["о"]="o";a["л"]="l";a["д"]="d";a["ж"]="zh";a["э"]="e";
   a["Я"]="Ya";a["Ч"]="Ch";a["С"]="S";a["М"]="M";a["И"]="I";a["Т"]="T";a["Ь"]="'";a["Б"]="B";a["Ю"]="Yu";
   a["я"]="ya";a["ч"]="ch";a["с"]="s";a["м"]="m";a["и"]="i";a["т"]="t";a["ь"]="'";a["б"]="b";a["ю"]="yu";

   for (const i in word){
     if (word.hasOwnProperty(i)) {
       if (a[word[i]] === undefined){
         answer += word[i];
       } else {
         answer += a[word[i]];
       }
     }
   }
   return answer;
}

const App: React.FC = () => {
  const [studentsListStr, setStudentsListStr] = React.useState("");
  const [rowLength, setRowLength] = React.useState(4);
  const [numerationOrder, setNumerationOrder] = React.useState("leftToRight");
  const [firstNumber, setFirstNumber] = React.useState(1);
  const [translateToLanguage, setTranslateToLanguage] = React.useState('nolang');
  const [isTranslating, setIsTranslating] = React.useState(false)

  const handleSetExampleStudentsList = () => {
    setStudentsListStr(sampleStudents);
  };

  const handleClear = () => {
    setStudentsListStr("");
    setTranslateToLanguage("nolang");
  };

  const handleTranslate = async (e: any) => {
    const targetLang = e.target.value;
    
    setIsTranslating(true);
    const apiUrl = import.meta.env.VITE_API_URL; 
    const response = await axios.post(apiUrl + "/translate", {
      text: studentsListStr,
      language: targetLang,
    });

    setStudentsListStr(response.data.translatedMessage.TranslatedText);
    setTranslateToLanguage(targetLang);
    setIsTranslating(false);
  }

  async function handleCreate() {
    console.log("creating", {
      studentsListStr,
      rowLength,
      numerationOrder,
      firstNumber,
    });

    const students = studentsListStr.split("\n");

    const studentsByRowNumbers = students.map((value, key) => ({
      row: Math.floor(key / rowLength),
      name: value,
    }));

    // console.log(studentsByRowNumbers)

    let sittingPlan: string[][] = [];
    for (const student of studentsByRowNumbers) {
      if (sittingPlan.hasOwnProperty(student.row)) {
        sittingPlan[student.row].push(student.name);
      } else {
        sittingPlan[student.row] = [student.name];
      }
    }

    // console.log(sittingPlan);

    const initialX = 0;
    const initialY = 0;
    const noteWidth = 60;
    const gapVertical = 70;
    const gapHorizontal = 70;

    type SittingPlaceType = {
      name: string;
      x: number;
      y: number;
    };

    let studentsWithCoordinates: SittingPlaceType[] = [];
    let rowNum = 0;
    for (const sittingPlanRow of sittingPlan) {
      let seatNo = 0;

      let x;

      for (const student of sittingPlanRow) {
        if (numerationOrder === "leftToRight") {
          x = initialX + seatNo * gapVertical;
        } else {
          x = initialX - seatNo * gapVertical;
        }
        studentsWithCoordinates.push({
          name: student,
          x,
          y: initialY - rowNum * gapHorizontal,
        });
        seatNo++;
      }
      rowNum++;
    }

    console.log(studentsWithCoordinates);

    let stickyNotes = [];
    let studentNumber = firstNumber;
    for (const student of studentsWithCoordinates) {
      const stickyNote = await miro.board.createStickyNote({
        content: `${student.name}\n${studentNumber}`,
        x: student.x,
        y: student.y,
        width: noteWidth,
      });
      studentNumber++;
      stickyNotes.push(stickyNote);
    }

    await miro.board.viewport.zoomTo(stickyNotes);
  }

  return (
    <div className="grid wrapper">
      {/* <div className="cs1 ce12">
        	<button
          onClick={() => handleAddStudentsList()}
          className="button button-primary" type="button">
            Добавить список студентов
          </button>
      </div> */}
      <div className="cs1 ce12">
        <div className="form-group">
          <label htmlFor="textarea-example">Список студентов</label>
          <textarea
            className="textarea"
            value={studentsListStr}
            onChange={(e) => setStudentsListStr(e.target.value)}
            placeholder="Вставьте сюда список студентов"
            rows={4}
            spellCheck="true"
            id="studentsList"
          />
          <a
            href="#"
            className="link link-text"
            onClick={handleSetExampleStudentsList}
          >
            пример
          </a>
          {" "}
          <a
            href="#"
            className="link link-text"
            onClick={handleClear}
          >
            очистить
          </a>

        </div>

        <button
          onClick={() => setStudentsListStr(transliterate(studentsListStr))}
          className="button button-secondary"
          disabled={studentsListStr === ""}
          type="button"
        >
          Перевести в транслит
        </button>

        <div className="form-group">
          <label htmlFor="translateToLanguage">Язык</label>
          <select
            className="select"
            id="translateToLanguage"
            disabled={studentsListStr === ""}
            value={translateToLanguage}
            onChange={handleTranslate}
          >
            <option value="nolang">-</option>
            {languages.map((lang) => (
              <option key={lang.code} value={lang.code}>
                {lang.name}
              </option>
            ))}
          </select>
          {isTranslating && <p>Translating.....</p>}
        </div>

        <hr />

        <div className="form-group">
          <label htmlFor="seatsOrder">Порядок нумерации</label>
          <select
            className="select"
            value={numerationOrder}
            onChange={(e) => setNumerationOrder(e.target.value)}
            id="seatsOrder"
          >
            <option value="leftToRight">1→2→3</option>
            <option value="rightToLeft">3←2←1</option>
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="rowLength">Длина ряда</label>
          <select
            className="select"
            value={rowLength}
            id="rowLength"
            onChange={(e) => setRowLength(parseInt(e.target.value))}
          >
            {Array.from({ length: 10 }, (_, i) => i + 1).map((el) => (
              <option key={el} value={el}>
                {el}
              </option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="firstNumber">Начальный номер</label>
          <select
            className="select"
            id="firstNumber"
            value={firstNumber}
            onChange={(e) => setFirstNumber(parseInt(e.target.value))}
          >
            {Array.from({ length: 50 }, (_, i) => i + 1).map((el) => (
              <option key={el} value={el}>
                {el}
              </option>
            ))}
          </select>
        </div>

        <div className="cs1 ce12">
          <button
            onClick={() => handleCreate()}
            className="button button-primary"
            type="button"
          >
            Создать
          </button>
        </div>
      </div>
    </div>
  );
};

const container = document.getElementById("root");
const root = createRoot(container);
root.render(<App />);
