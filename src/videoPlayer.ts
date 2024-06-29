import { MonthList, WeekList } from "./utils/tableTitles";
import { ContributionDataLevels, init, normalizeToRange } from "./utils/utils";

let isPause = true;
const video = document.createElement('video');

init(()=>{
    const playButton = document.getElementById('playButton')
    const pauseButton = document.getElementById('pauseButton')

    playButton?.addEventListener('click', () => {
        // const videoFileInput = <HTMLInputElement>document.getElementById('videoFileInput');
        // if (!videoFileInput || !videoFileInput.files || !videoFileInput.files.length) {
        //     alert('動画ファイルを選択してください');
        //     return;
        // }

        // const videoFile = videoFileInput.files[0];
        // startVideoProcessing(videoFile);
        const videoSelect = <HTMLSelectElement>document.getElementById('videoSelect');
        if (!videoSelect || !videoSelect.value) {
            alert('動画ファイルを選択してください');
            return;
        }
        isPause = false;
        startVideoProcessing(chrome.runtime.getURL(videoSelect.value));
    });

    pauseButton?.addEventListener('click', () => {
        isPause = true;
        video.pause();
    });

}, 2050);

async function startVideoProcessing(videoFilePath: string) {
    const canvas = document.createElement('canvas');
    // const canvas = <HTMLCanvasElement>document.getElementById('videoCanvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // video.src = URL.createObjectURL(videoFile);
    video.src = videoFilePath

    video.onloadedmetadata = async function () {
        const videoRatio = video.videoWidth / video.videoHeight;

        await video.play(); // ビデオの再生開始

        // とりあえず連続でやってフレームに追いつく
        const intervalId = setInterval(async function () {
            let frameWidth = parseInt((<HTMLInputElement>document.getElementById('widthInput')).value);
            let frameHeight = parseInt((<HTMLInputElement>document.getElementById('heightInput')).value);

            // @ts-ignore
            if (frameWidth != NaN && frameHeight == NaN) {
                frameHeight = Math.round(frameWidth * videoRatio)
            // @ts-ignore
            } else if (frameWidth == NaN && frameHeight != NaN) {
                frameWidth = Math.round(frameHeight / videoRatio)
            }

            canvas.width = frameWidth;
            canvas.height = frameHeight;

            
            ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
            const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
            const pixels = imageData.data;

            // グレースケール変換とレベルに合わせて出力
            let frameData = [];
            let frameDataLine = [];
            // [r,g,b, r,g,b,] みたいな構造っぽい
            for (let i = 0; i < pixels.length; i += 4) {
                const gray = (pixels[i] + pixels[i + 1] + pixels[i + 2]) / 3;
                // pixels[i] = avg; // Red
                // pixels[i + 1] = avg; // Green
                // pixels[i + 2] = avg; // Blue

                const dataLevelGray = Math.floor((gray / 255) * (ContributionDataLevels.length - 1))
                frameDataLine.push(ContributionDataLevels[dataLevelGray])
                if ((i / 4 + 1) % frameWidth === 0) {
                    frameData.push(frameDataLine)
                    frameDataLine = []
                }
            }

            overwriteContributionTable(frameData)

            // ビデオが終了したら処理を停止
            if (video.ended || isPause) {
                clearInterval(intervalId);
            }
        }, 1);
        // }, 1000 / video.playbackRate); // フレーム間の間隔を計算
    };

    video.onerror = function () {
        alert('Error loading video.');
    };

    video.play().catch(function () {
        alert('Cannot auto-play video. Please click play button.');
    });
}


function overwriteContributionTable(frameData: number[][]) {
    const contributionTable = document.getElementsByClassName('ContributionCalendar-grid')[0];
    // contributionTable.classList.add('custom-table');
    contributionTable.innerHTML = `<caption class="sr-only">Contribution Graph</caption>`

    const monthTr = document.createElement('tr');
    monthTr.style.height = '13px'
    monthTr.innerHTML = `
        <td style="width: 28px">
            <span class="sr-only">Day of Week</span>
        </td>
    `
    const thead = document.createElement('thead');
    thead.appendChild(monthTr);

    frameData[0].forEach((pixel, index) => { // 横幅
        if (index % 4 != 0) return;
        const month = MonthList[normalizeToRange(index + 1, 12) - 1];
        monthTr.innerHTML += `
            <td class="ContributionCalendar-label" colspan="${month.colspan}" style="position: relative">
                <span class="sr-only">${month.name}</span>
                <span aria-hidden="true" style="position: absolute; top: 0">${month.name}</span>
            </td>
        `
    });
    contributionTable.appendChild(thead)

    const tbody = document.createElement('tbody');
    frameData.forEach((line, index) => { // 縦
        const row = document.createElement('tr');
        row.style.height = '10px'
        tbody.appendChild(row);

        if ((index + 1) % 2 == 0) {
            const week = WeekList[normalizeToRange(index + 1, 7) - 1].name
            row.innerHTML = `
                <td class="ContributionCalendar-label" style="position: relative">
                    <span class="sr-only">${week}</span>
                    <span aria-hidden="true" style="clip-path: Circle(0); position: absolute; bottom: -3px">
                        ${week}
                    </span>
                </td>
            `
        } else {
            const week = WeekList[normalizeToRange(index + 1, 7) - 1].name
            row.innerHTML = `
                <td class="ContributionCalendar-label" style="position: relative">
                    <span class="sr-only">${week}</span>
                    <span aria-hidden="true" style="clip-path: None; position: absolute; bottom: -3px">
                        ${week}
                    </span>
                </td>
            `
        }

        line.forEach((pixel, index) => {
            row.innerHTML += `
                <td tabindex="0" data-ix="0" aria-selected="false" aria-describedby="contribution-graph-legend-level-0" style="width: 10px" id="contribution-day-component-0-0" data-level="${ContributionDataLevels[pixel]}" role="gridcell" data-view-component="true" class="ContributionCalendar-day"></td>
            `
        });
    });
    contributionTable.appendChild(tbody)
}

export {}