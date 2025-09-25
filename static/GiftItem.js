// Custom Html Element: <gift-item></gift-item>

import("./checkbox.js");

class GiftItem extends HTMLElement {
  interval = null;

  pending = true;

  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this.shadowRoot.innerHTML = `
        <style>
            :host {
                width: calc(300px + 2rem);
                display: flex;
                border: 1px solid #acac;
                padding: 1.5rem 1rem;
                flex-direction: column;
                align-content: space-evenly;
                margin-bottom: 1rem;
            }
            h2 {
                margin: 0;
            }
            p {
                margin: 0;
                margin-bottom: 1rem;
            }
            #picture-link {
                text-decoration: none;
                border-ottom: none;
            }
            picture {
                display: flex;
                justify-content: center;
                aspect-ratio: 1;
                width: 100%;
                align-items: center;
                align-content: center;
            }
            picture img {
                background: white;
                backgroundBlendMode: normal;
                width: 100%;
                aspect-ratio: 1;
                object-fit: contain;
                margin-bottom: 0;
            }
            #link {
                margin-top: auto;
            }
            #reserved-label {
                background: none;
                border: none;
                padding: 0.25rem;
                width: fit-content;
                display: flex;
                align-items: center;
                margin-top: 1rem;
            }
            #reserved-label::focus-within {
                outline: 1px solid #ededf0
            }
        </style>
        <a id="picture-link" href="">
            <picture>
                <img src="" alt="" />
            </picture>
        </a>
        <h3 id="title"></h3>
        <p id="description"></p>
        <a href="" id="link"></a>
        `;
  }

  connectedCallback() {
    this.shadowRoot.querySelector("#picture-link").href =
      this.getAttribute("link");
    this.shadowRoot.querySelector("img").src = this.getAttribute("image");
    this.shadowRoot.querySelector("img").alt = this.getAttribute("alt");
    this.shadowRoot.querySelector("h3").textContent =
      this.getAttribute("title");

    const formattedPrice = Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0,
    }).format(this.getAttribute("price"));

    const description = `${this.getAttribute("description")}${
      this.getAttribute("price") ? ` - ${formattedPrice}` : ""
    }`;

    this.shadowRoot.querySelector("#description").textContent = description;

    this.shadowRoot.querySelector("#link").textContent =
      this.getAttribute("linktext");
    this.shadowRoot.querySelector("#link").href = this.getAttribute("link");

    // Checkbox for reserved status
    const label = document.createElement("button");
    label.id = "reserved-label";
    this.shadowRoot.appendChild(label);
    const checkbox = document.createElement("paper-checkbox");
    checkbox.setAttribute("disabled", "");
    label.addEventListener("click", async () => {
      checkbox.setAttribute("disabled", "");
      this.pending = true;

      this.interval = clearInterval(this.interval);
      const response = await fetch(
        `https://eoexx-syaaa-aaaab-qahzq-cai.icp0.io/gifts/${this.id}/toggle`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      if (response.ok) {
        const json = await response.json();
        const { status } = json;
        this.updateCheckbox(status);
        this.pollStatus();
      }
    });
    label.appendChild(checkbox);
    const span = document.createElement("span");
    span.textContent = "Reserved";
    label.appendChild(span);

    this.status().then(() => {
      this.pending = false;
    });
  }

  static get observedAttributes() {
    return [
      "title",
      "description",
      "price",
      "image",
      "alt",
      "link",
      "linktext",
    ];
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (oldValue !== newValue) {
      switch (name) {
        case "title":
          this.shadowRoot.querySelector("h3").textContent = newValue;
          break;
        case "description":
          this.shadowRoot.querySelector("p").textContent = newValue;
          break;
        case "price":
          this.shadowRoot.querySelector("p").textContent = `${this.getAttribute(
            "description"
          )} - ${newValue}`;
          break;
        case "image":
          this.shadowRoot.querySelector("img").src = newValue;
          break;
        case "alt":
          this.shadowRoot.querySelector("img").alt = newValue;
          break;
        case "link":
          this.shadowRoot.querySelector("#link").href = newValue;
          break;
        case "linktext":
          this.shadowRoot.querySelector("#link").textContent = newValue;
          break;
      }
    }
  }

  pollStatus() {
    this.interval = setInterval(() => {
      if (!this.pending) {
        this.status();
      }
    }, 10000);
  }

  async status() {
    return await fetch(
      `https://eoexx-syaaa-aaaab-qahzq-cai.icp0.io/gifts/${this.id}`
    ).then(async (response) => {
      if (response.ok) {
        const json = await response.json();
        const { status } = json;
        this.updateCheckbox(status);

        return response;
      }
      throw new Error("Network response was not ok.");
    });
  }

  /**
   *
   * @param {"bought" | "ubought"} state
   */
  updateCheckbox(state) {
    // ensure the state is valid
    if (!["bought", "unbought"].includes(state)) {
      throw new Error("Invalid checkbox state");
    }

    const checkbox = this.shadowRoot.querySelector("paper-checkbox");

    switch (state) {
      case "bought":
        if (!checkbox.hasAttribute("checked")) {
          checkbox.setAttribute("checked", "");
        }
        break;
      case "unbought":
        if (checkbox.hasAttribute("checked")) {
          checkbox.removeAttribute("checked");
        }
        break;
    }
    checkbox.removeAttribute("disabled");
    this.pending = false;
  }
}

customElements.define("gift-item", GiftItem);
