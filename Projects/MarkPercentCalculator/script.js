import Marks from "./Marks.js";


const subjectArr = ["English Language", "English Literature", "Tamil", "Mathematics", "Biology", "Chemistry", "Physics", "Computer Science", "Geography", "History" ];
const keyArr = ["engLang", "engLit", "tamil", "math", "bio", "chem", "phy", "comp", "geo", "his"];


const midTerm = new Marks("Mid Term Exam", 25, "mid-term-exam", 20, 18, 15, 24, 22, 21, 19, 18, 20, 14);
const halfYearly = new Marks("Half Yearly Exam", 80,"half-yearly-exam", 70, 69, 47, 67, 76, 55, 74, 73, 62, 71);


const exams =[midTerm, halfYearly];


const main = document.querySelector("main");


const marksTable = document.createElement("table");
marksTable.classList.add("mark-table");


marksTable.innerHTML = `
    <tr class="table-header">
        <th class="table-header" rowspan="2">Subject</th>
    </tr>
    <tr class="sub-header"></tr>
`
for(let i = 1; i <= subjectArr.length; i++) {
    const row = document.createElement("tr");
    row.classList.add("rows", `row-${i}`)


    const column = document.createElement("td");
    column.classList.add("table-text")
    column.innerText = subjectArr[i-1];

    row.append(column);
    marksTable.append(row);
}


const totalMarks = document.createElement("tr");
totalMarks.classList.add("row-totalM");
totalMarks.innerHTML = `
    <td class="table-text">Total Marks = </td>
`
const totalPercent = document.createElement("tr");
totalPercent.classList.add("row-totalP");
totalPercent.innerHTML = `
    <td class="table-text">Total Percentage = </td>
`
marksTable.append(totalMarks, totalPercent);




exams.forEach((exam) => {
    {
        const tableHeader = marksTable.querySelector("tr.table-header");

        const examHeading = document.createElement("th");
        examHeading.classList.add("table-header")
        examHeading.setAttribute("colspan", "2");
        examHeading.innerText = exam.name;

        tableHeader.append(examHeading);
    }
    {
        const tableSubHeader = marksTable.querySelector(".sub-header");

        const mark = document.createElement("th");
        mark.innerText = "Marks";
        const percent = document.createElement("th");
        percent.innerText = "Percentage";

        tableSubHeader.append(mark, percent);
    }


    let total = 0;
    for(let i = 1; i <= subjectArr.length; i++) {
        const row = marksTable.querySelector(`.row-${i}`)
       
        let mark = exam[keyArr[i-1]];
        total += mark;
        let percent = (mark/exam.totalMarks * 100).toFixed(2);


        const markCol = document.createElement("td");
        markCol.classList.add("table-text", "marks", exam.className)
        markCol.innerText = mark;


        const percentCol = document.createElement("td");
        percentCol.classList.add("table-text")
        percentCol.innerText = percent;
        

        switch(true) {
            case percent>=80:
                percentCol.classList.add("good");
                break;
            case percent>=60 && percent<80:
                percentCol.classList.add("moderate");
                break;
            case percent<60:
                percentCol.classList.add("bad");
                break;
        }
   
        row.append(markCol, percentCol);
    }
    const totalP = total/(exam.totalMarks*10) * 100;


    const totalMar = document.createElement("td");
    totalMar.classList.add("table-text");
    totalMar.setAttribute("colspan", "2");
    totalMar.innerText = total + "/" + exam.totalMarks*10;
    marksTable.querySelector(".row-totalM").append(totalMar);


    const totalPer = document.createElement("td");
    totalPer.classList.add("table-text");
    totalPer.setAttribute("colspan", "2");
    totalPer.innerText = totalP + "%";
    marksTable.querySelector(".row-totalP").append(totalPer);
});

main.append(marksTable);

const breakb = document.createElement("br");
main.append(breakb);


const percentButton = document.createElement("button");
percentButton.innerText = "Compute Percentage";
main.append(percentButton);

const resetButton = document.createElement("button");
resetButton.innerText = "Reset";
main.append(resetButton);


const markList = marksTable.querySelectorAll(".marks");
markList.forEach((m) => {
    m.addEventListener("click", () => {
        m.classList.toggle("percent-selected");
    })
});


const examDetermine = function (exams) {
    for(let i = 0; i < exams.length; i++) {
        let exam = exams[i];
        for(let i = 1; i <= keyArr.length; i++) {
            const row = marksTable.querySelector(`.row-${i}`)
            const selectedMark = row.querySelector(`.marks.${exam.className}`);
   
            if(selectedMark.classList.contains("percent-selected")) {
                return exam;
            }
        }
    }
};

let percentage = document.createElement("p");
    percentage.classList.add("percentage-display");
    main.append(percentage);


percentButton.addEventListener("click", () => {
    const exam = examDetermine(exams);
    let total=0, count=0;
    for(let i = 1; i <= keyArr.length; i++) {
        const row = marksTable.querySelector(`.row-${i}`)
           
        const selectedMark = row.querySelector(`.marks.${exam.className}`);
        let mark = exam[keyArr[i-1]];


        if(selectedMark.classList.contains("percent-selected"))
        {
            total += mark;
            count++;
        }
    }

    const per = (total/(exam.totalMarks*count)) * 100;

    percentage.innerHTML = `
        Percentage = ${per.toFixed(2)}%
    `
});

resetButton.addEventListener("click", () => {
    const exam = examDetermine(exams);
    for(let i = 1; i <= keyArr.length; i++) {
        const row = marksTable.querySelector(`.row-${i}`)
        const selectedMark = row.querySelector(`.marks.${exam.className}`);


        if(selectedMark.classList.contains("percent-selected"))
        {
            selectedMark.classList.remove("percent-selected")
        }
    }
    percentage.innerText = ` `
})
