// 사진 크게 보기
const photoItems = document.querySelectorAll(".photo-item img");
const photoModal = document.getElementById("photoModal");
const modalImage = document.getElementById("modalImage");
const photoModalClose = document.querySelector(".photo-modal-close");

photoItems.forEach(img => {
    img.addEventListener("click", () => {
        modalImage.src = img.src;
        photoModal.style.display = "flex";
    });
});

photoModalClose.addEventListener("click", () => {
    photoModal.style.display = "none";
    modalImage.src = "";
});

photoModal.addEventListener("click", (e) => {
    if (e.target === photoModal) {
        photoModal.style.display = "none";
        modalImage.src = "";
    }
});

// 사진 업로드
const API_URL = "https://script.google.com/macros/s/AKfycbzIDYmaqSQ8UOcPbmO1pazjluGM52x2nhd6ZjyO8ANJZIvL67QUhPp26_Otr-vDYbWD/exec";

const photoInput = document.getElementById("photoInput");
const uploadButton = document.getElementById("uploadButton");
const uploadStatus = document.getElementById("uploadStatus");
const photoDescription = document.getElementById("photoDescription");

uploadButton.addEventListener("click", async () => {

    const file = photoInput.files[0];
    const description = photoDescription.value.trim();

    if (!file) {
        uploadStatus.textContent = "사진을 먼저 선택해주세요.";
        return;
    }

    uploadStatus.textContent = "사진 최적화 중...";

    const reader = new FileReader();

    reader.onload = () => {

        const image = new Image();

        image.onload = async () => {

            const maxWidth = 1600;

            let width = image.width;
            let height = image.height;

            if (width > maxWidth) {
                height = Math.round(height * (maxWidth / width));
                width = maxWidth;
            }

            const canvas = document.createElement("canvas");

            canvas.width = width;
            canvas.height = height;

            const ctx = canvas.getContext("2d");

            ctx.drawImage(image, 0, 0, width, height);

            const compressedData = canvas.toDataURL(
                "image/jpeg",
                0.82
            );

            const base64Data = compressedData.split(",")[1];

            const data = {
                fileName: file.name.replace(/\.[^/.]+$/, "") + ".jpg",
               mimeType: "image/jpeg",
                data: base64Data,
                description: description
            };

            uploadStatus.textContent = "사진 업로드 중...";

            try {

                const response = await fetch(API_URL, {
                    method: "POST",
                    body: JSON.stringify(data)
                });

                const result = await response.json();

                if (result.success) {
                    uploadStatus.textContent = "사진 업로드 완료!";
                    photoInput.value = "";
                    photoDescription.value = "";
                } else {
                    uploadStatus.textContent = "업로드에 실패했습니다.";
                }

            } catch (error) {

                console.error(error);
                uploadStatus.textContent = "업로드 중 오류가 발생했습니다.";

            }
        };

        image.src = reader.result;
    };

        reader.readAsDataURL(file);
});

// Google Drive 사진 불러오기
async function loadDrivePhotos() {

    const photoGrid = document.getElementById("photoGrid");

    console.log("photoGrid:", photoGrid);

    try {

        const response = await fetch(
            API_URL + "?action=getPhotos"
        );

        const result = await response.json();

        if (!result.success) {
            return;
        }

        console.log("불러온 사진:", result.photos);
        
        result.photos.forEach(photo => {

            const photoItem = document.createElement("div");

            photoItem.className = "photo-item";

            photoItem.innerHTML = `
                <img
                    src="${photo.url}"
                    alt="${photo.fileName}"
                    referrerpolicy="no-referrer"
                >
                <div class="photo-caption">
                    ${photo.description}
                </div>
            
            <button class="photo-delete-button">
                삭제
            </button>
            `;


            photoGrid.appendChild(photoItem);

const img = photoItem.querySelector("img");

img.addEventListener("click", () => {

    modalImage.src = img.src;
    photoModal.style.display = "flex";

});

const deleteButton = photoItem.querySelector(".photo-delete-button");

deleteButton.addEventListener("click", async (e) => {

    e.stopPropagation();

    const password = prompt("삭제 비밀번호를 입력하세요.");

    if (!password) {
        return;
    }

    try {

        const response = await fetch(
            API_URL
            + "?action=deletePhoto"
            + "&fileId=" + encodeURIComponent(photo.fileId)
            + "&password=" + encodeURIComponent(password)
        );

        const result = await response.json();

        if (result.success) {

            photoItem.remove();

            alert("사진이 삭제되었습니다.");

        } else {

            alert(result.message || "사진 삭제에 실패했습니다.");

        }

    } catch (error) {

        console.error(error);

        alert("사진 삭제 중 오류가 발생했습니다.");

    }

});

        });

        } catch (error) {

        console.error("사진 불러오기 오류:", error);

    }
}

// 기존 사진에도 삭제 버튼 추가

document.querySelectorAll(".photo-item").forEach(photoItem => {

    if (photoItem.querySelector(".photo-delete-button")) {
        return;
    }

    const deleteButton = document.createElement("button");

    deleteButton.className = "photo-delete-button";
    deleteButton.textContent = "삭제";

    photoItem.appendChild(deleteButton);

});

// JOURNAL 등록

const journalTitle = document.getElementById("journalTitle");
const journalContent = document.getElementById("journalContent");
const journalSaveButton = document.getElementById("journalSaveButton");
const journalStatus = document.getElementById("journalStatus");

journalSaveButton.addEventListener("click", async () => {

    const title = journalTitle.value.trim();
    const content = journalContent.value.trim();

    if (!title) {
        journalStatus.textContent = "제목을 입력해주세요.";
        return;
    }

    if (!content) {
        journalStatus.textContent = "내용을 입력해주세요.";
        return;
    }

    journalStatus.textContent = "글 저장 중...";

    const data = {
        action: "addJournal",
        title: title,
        content: content
    };

    try {

        const response = await fetch(API_URL, {
            method: "POST",
            body: JSON.stringify(data)
        });

        console.log("응답 상태:", response.status);
        
        const result = await response.json();

        if (result.success) {

            journalStatus.textContent = "글이 등록되었습니다.";

            journalTitle.value = "";
            journalContent.value = "";

        } else {

            journalStatus.textContent = "글 등록에 실패했습니다.";

        }

    } catch (error) {

        console.error(error);

        journalStatus.textContent = "글 등록 중 오류가 발생했습니다.";

    }

});

loadDrivePhotos();

// ABOUT 등록

const aboutTitle = document.getElementById("aboutTitle");
const aboutContent = document.getElementById("aboutContent");
const aboutSaveButton = document.getElementById("aboutSaveButton");
const aboutStatus = document.getElementById("aboutStatus");

aboutSaveButton.addEventListener("click", async () => {

    const title = aboutTitle.value.trim();
    const content = aboutContent.value.trim();

    if (!title) {
        aboutStatus.textContent = "제목을 입력해주세요.";
        return;
    }

    if (!content) {
        aboutStatus.textContent = "내용을 입력해주세요.";
        return;
    }

    aboutStatus.textContent = "글 저장 중...";

    const data = {
        action: "addAbout",
        title: title,
        content: content
    };

    try {

        const response = await fetch(API_URL, {
            method: "POST",
            body: JSON.stringify(data)
        });

        const result = await response.json();

        if (result.success) {

            aboutStatus.textContent = "글이 등록되었습니다.";

            aboutTitle.value = "";
            aboutContent.value = "";

            loadAbout();

        } else {

            aboutStatus.textContent = "글 등록에 실패했습니다.";

        }

    } catch (error) {

        console.error("ABOUT 등록 오류:", error);

        aboutStatus.textContent = "글 등록 중 오류가 발생했습니다.";

    }

});

// ABOUT 불러오기

async function loadAbout() {

    const aboutList = document.getElementById("aboutList");

    try {

        const response = await fetch(
            API_URL + "?action=getAbout"
        );

        const result = await response.json();

        if (!result.success) {
            return;
        }

        aboutList.innerHTML = "";

        result.about.forEach(about => {

            const aboutItem = document.createElement("article");

            aboutItem.className = "about-item";

            aboutItem.innerHTML = `
    <p class="about-date">
        ${new Date(about.date).toLocaleDateString("ko-KR")}
    </p>

    <h3>
        ${about.title}
    </h3>

    <p>
        ${about.content}
    </p>

    <button class="about-delete-button">
        삭제
    </button>
`;

            aboutList.appendChild(aboutItem);

const deleteButton =
    aboutItem.querySelector(".about-delete-button");

deleteButton.addEventListener("click", async () => {

    const password = prompt("삭제 비밀번호를 입력하세요.");

    if (!password) {
        return;
    }

    try {

        const response = await fetch(
            API_URL
            + "?action=deleteAbout"
            + "&row=" + encodeURIComponent(
                result.about.indexOf(about) + 2
            )
            + "&password=" + encodeURIComponent(password)
        );

        const resultData = await response.json();

        if (resultData.success) {

            aboutItem.remove();

            alert("글이 삭제되었습니다.");

        } else {

            alert(
                resultData.message ||
                "글 삭제에 실패했습니다."
            );

        }

    } catch (error) {

        console.error("ABOUT 삭제 오류:", error);

        alert("글 삭제 중 오류가 발생했습니다.");

    }

});

});

    } catch (error) {

        console.error("ABOUT 불러오기 오류:", error);

    }

}

// JOURNAL 불러오기
async function loadJournals() {

    const journalList = document.getElementById("journalList");

    try {

        const response = await fetch(
            API_URL + "?action=getJournals"
        );

        const result = await response.json();

        if (!result.success) {
            return;
        }

        journalList.innerHTML = "";

        result.journals.forEach((journal, index) => {

    const journalItem = document.createElement("article");

    journalItem.className = "journal-item";

    const sheetRow = index + 2;

    journalItem.innerHTML = `
        <p class="journal-date">
            ${new Date(journal.date).toLocaleDateString("ko-KR")}
        </p>

        <h3>
            ${journal.title}
        </h3>

        <p>
            ${journal.content}
        </p>

        <button class="journal-delete-button">
            삭제
        </button>
    `;

    journalList.appendChild(journalItem);


    const deleteButton =
        journalItem.querySelector(".journal-delete-button");

    deleteButton.addEventListener("click", async () => {

        const password = prompt("삭제 비밀번호를 입력하세요.");

        if (!password) {
            return;
        }

        try {

            const response = await fetch(
                API_URL
                + "?action=deleteJournal"
                + "&row=" + encodeURIComponent(sheetRow)
                + "&password=" + encodeURIComponent(password)
            );

            const result = await response.json();

            if (result.success) {

                journalItem.remove();

                alert("글이 삭제되었습니다.");

            } else {

                alert(result.message || "글 삭제에 실패했습니다.");

            }

        } catch (error) {

            console.error("JOURNAL 삭제 오류:", error);

            alert("글 삭제 중 오류가 발생했습니다.");

        }

    });

});

    } catch (error) {

        console.error("JOURNAL 불러오기 오류:", error);

    }

}

loadJournals();
loadAbout();