async function main() {
  async function fetchTwitchTrackerData(streamerName = "squib_channel") {
    const url = "https://twitchtracker.com/api/channels/summary/";
    let endpoint = url + streamerName;

    try {
      const response = await fetch(endpoint);

      if (!response.ok) {
        return [response.ok, response.status];
      }

      const data = await response.json();
      return [data, response];
    } catch (error) {
      console.error("Error Fetching Data", error);
      throw error;
    }
  }

  const squibData = await fetchTwitchTrackerData();

  const entryBox = document.getElementById("entry-box");
  const squibDataDisplay = document.getElementById("squib-data-display");

  let ttDataStructure = {
    rank: `Rank: ${squibData[0].rank}`,
    min_streamed: `Minutes Streamed: ${squibData[0].minutes_streamed}`,
    avg_viewers: `Avg Viewers: ${squibData[0].avg_viewers}`,
    max_viewers: `Max Viewers: ${squibData[0].max_viewers}`,
    hrs_watched: `Hours Watched: ${squibData[0].hours_watched}`,
    followers: `Followers: ${squibData[0].followers}`,
    followers_total: `Followers Total: ${squibData[0].followers_total}`,
  };

  function createTTDiv(dataStructure) {
    const allPTags = [];

    Object.entries(dataStructure).forEach(([key, value]) => {
      let squibPTag = document.createElement("p");
      squibPTag.id = `${key}-tag`;
      squibPTag.textContent = value;
      allPTags.push(squibPTag);
    });

    return allPTags;
  }

  function displayGuestData(dataStructure) {
    guestDisplay.innerHTML = "";

    const guestNameTitle = document.createElement("h3");
    guestNameTitle.textContent = searchText;
    guestDisplay.appendChild(guestNameTitle);

    const guestDisplayData = createTTDiv(dataStructure);
    guestDisplayData.forEach((ele, i) => {
      const keyName = Object.keys(dataStructure)[i];
      const humanReadableKeyName = convertToHumanReadable(keyName);
      ele.textContent = humanReadableKeyName + `: ${ele.textContent}`;
      guestDisplay.appendChild(ele);
    });
  }

  function displayError(statusCode) {
    const fetchError = document.createElement("h2");
    fetchError.id = "fetch-error";
    fetchError.textContent = `Network Error: ${statusCode}`;
    squibDataDisplay.appendChild(fetchError);
    return squibData[0];
  }

  const squibNameTitle = document.createElement("h2");

  function prepareTrackerDiv() {
    const trackerDiv = createTTDiv(ttDataStructure);

    squibNameTitle.id = "squib-name-title";
    squibNameTitle.textContent = "squib_channel";
    squibDataDisplay.appendChild(squibNameTitle);

    squibData[0]
      ? trackerDiv.forEach((ele) => {
          squibDataDisplay.appendChild(ele);
        })
      : displayError(squibData[1]);
  }

  prepareTrackerDiv();

  let squibTextBox, squibButton;

  if (!squibData[0]) {
    // If things go wrong you can do stuff here
    squibNameTitle.style.display = "none";
    document.getElementById("guest-display").style.display = "none";
  } else {
    function createSquibTextBox() {
      const textBox = document.createElement("textarea");
      textBox.rows = 1;
      textBox.id = "squib-search-text-entry";
      textBox.addEventListener("input", () => {
        // Remove any newlines added to the text content
        textBox.value = textBox.value.replace(/\n/g, "");
      });
      return textBox;
    }

    squibTextBox = createSquibTextBox();
    entryBox.appendChild(squibTextBox);

    function createSquibButton(squibId = "squib-button", squibText = "search") {
      const button = document.createElement("button");
      button.id = squibId;
      button.textContent = squibText;
      return button;
    }

    squibButton = createSquibButton();
    entryBox.appendChild(squibButton);
  }

  let searchText;
  squibTextBox.addEventListener("change", () => {
    searchText = squibTextBox.value;
  });
  let searchResults;
  let clonedTTDataStructure;
  const guestDisplay = document.getElementById("guest-display");
  guestDisplay.style.display = "none";

  function convertToHumanReadable(key) {
    return key
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  }

  squibButton.addEventListener("click", async () => {
    searchResults = await fetchTwitchTrackerData(searchText);

    if (searchResults[0]) {
      guestDisplay.style.display = "grid";
      clonedTTDataStructure = { ...searchResults[0] };
      console.log([searchText, clonedTTDataStructure]);
      squibTextBox.value = "";

      displayGuestData(clonedTTDataStructure);
    } else {
      console.log("bad fetch on guest data");
    }
  });
}

main();
