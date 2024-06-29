import { MonthList, WeekList } from "./utils/tableTitles";
import { ColorMode, ContributionDataLevels, ContributionLikeGrayScale, init, normalizeToRange } from "./utils/utils";

let isPause = true;
const video = document.createElement('video');

init(() => {
    const playButton = document.getElementById('playButton')
    const pauseButton = document.getElementById('pauseButton')

    playButton?.addEventListener('click', () => {
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

}, 1500);

async function startVideoProcessing(videoFilePath: string) {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

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
                const colorModeSelect = <HTMLSelectElement>document.getElementById('colorModeSelect');
                if (colorModeSelect.value == 'contributionDataLevels') {
                    const gray = (pixels[i] + pixels[i + 1] + pixels[i + 2]) / 3;
                    // pixels[i] = avg; // Red
                    // pixels[i + 1] = avg; // Green
                    // pixels[i + 2] = avg; // Blue
    
                    const dataLevelGray = Math.floor((gray / 256 * ContributionDataLevels.length))
                    frameDataLine.push(dataLevelGray)
                    if ((i / 4 + 1) % frameWidth === 0) {
                        frameData.push(frameDataLine)
                        frameDataLine = []
                    }
                } else if (colorModeSelect.value == 'contributionLikeGrayScale') {
                    const gray = (pixels[i] + pixels[i + 1] + pixels[i + 2]) / 3;
    
                    const dataLevelLikeGray = Math.floor((gray / 256 * ContributionLikeGrayScale.length))
                    frameDataLine.push(dataLevelLikeGray)
                    if ((i / 4 + 1) % frameWidth === 0) {
                        frameData.push(frameDataLine)
                        frameDataLine = []
                    }
                } else if (colorModeSelect.value == 'color') {
                    frameDataLine.push([
                        pixels[i],
                        pixels[i + 1],
                        pixels[i + 2]
                    ])
                    if ((i / 4 + 1) % frameWidth === 0) {
                        frameData.push(frameDataLine)
                        frameDataLine = []
                    }
                }
            }

            // console.log(frameData)

            // @ts-ignore
            overwriteContributionTable(frameData)

            // ビデオが終了したら処理を停止
            if (video.ended || isPause) {
                clearInterval(intervalId);
            }
        }, 1);
    };

    video.onerror = function () {
        alert('Error loading video.');
    };

    video.play().catch(function () {
        alert('Cannot auto-play video. Please click play button.');
    });
}


function overwriteContributionTable(frameData: number[][] | number[][][]) {
    const contributionTable = document.getElementsByClassName('ContributionCalendar-grid')[0];
    // contributionTable.classList.add('custom-table');
    contributionTable.innerHTML = `<caption class="sr-only">Contribution Graph</caption>`;

    let monthTrHTML = '<tr style="height: 13px">';

    monthTrHTML += `
        <td style="width: 28px">
            <span class="sr-only">Day of Week</span>
        </td>
    `;

    frameData[0].forEach((pixel, index) => { // 横幅
        if (index % 4 != 0) return;
        const month = MonthList[normalizeToRange(index + 1, 12) - 1];
        monthTrHTML += `
            <td class="ContributionCalendar-label" colspan="${month.colspan}" style="position: relative">
                <span class="sr-only">${month.name}</span>
                <span aria-hidden="true" style="position: absolute; top: 0">${month.name}</span>
            </td>
        `;
    });

    contributionTable.innerHTML += `
        <thead>
            ${monthTrHTML}
        </thead>
    `;

    let tbodyHTML = '<tbody>';

    frameData.forEach((line, index) => { // 縦

        tbodyHTML += '<tr style="height: 10px">';

        if ((index + 1) % 2 == 0) {
            const week = WeekList[normalizeToRange(index + 1, 7) - 1].name
            tbodyHTML += `
                <td class="ContributionCalendar-label" style="position: relative">
                    <span class="sr-only">${week}</span>
                    <span aria-hidden="true" style="clip-path: Circle(0); position: absolute; bottom: -3px">
                        ${week}
                    </span>
                </td>
            `;
        } else {
            const week = WeekList[normalizeToRange(index + 1, 7) - 1].name
            tbodyHTML += `
                <td class="ContributionCalendar-label" style="position: relative">
                    <span class="sr-only">${week}</span>
                    <span aria-hidden="true" style="clip-path: None; position: absolute; bottom: -3px">
                        ${week}
                    </span>
                </td>
            `;
        }
        
        line.forEach((pixel: any, index) => {
            const colorModeSelect = <HTMLSelectElement>document.getElementById('colorModeSelect');
            if (colorModeSelect.value == 'contributionDataLevels') {
                tbodyHTML += `
                    <td tabindex="0" data-ix="0" aria-selected="false" aria-describedby="contribution-graph-legend-level-0" style="width: 10px" id="contribution-day-component-0-0" data-level="${ContributionDataLevels[pixel]}" role="gridcell" data-view-component="true" class="ContributionCalendar-day"></td>
                `;
            } else if (colorModeSelect.value == 'contributionLikeGrayScale') {
                tbodyHTML += `
                    <td tabindex="0" data-ix="0" aria-selected="false" aria-describedby="contribution-graph-legend-level-0" style="width: 10px; background-color: ${ContributionLikeGrayScale[pixel]};" id="contribution-day-component-0-0" role="gridcell" data-view-component="true" class="ContributionCalendar-day"></td>
                `;
            } else if (colorModeSelect.value == 'color') {
                tbodyHTML += `
                    <td tabindex="0" data-ix="0" aria-selected="false" aria-describedby="contribution-graph-legend-level-0" style="width: 10px; background-color: rgb(${pixel[0]}, ${pixel[1]}, ${pixel[2]});" id="contribution-day-component-0-0" role="gridcell" data-view-component="true" class="ContributionCalendar-day"></td>
                `;
            }
        });
        tbodyHTML += '</tr>';
    });

    tbodyHTML += '</tbody>';
    contributionTable.innerHTML += tbodyHTML;
    tbodyHTML = '';
}

export {}