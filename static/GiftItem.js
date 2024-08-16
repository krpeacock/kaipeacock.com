// Custom Html Element: <gift-item></gift-item>

class GiftItem extends HTMLElement {
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

    const description = `${this.getAttribute("description")}${
      this.getAttribute("price") ? ` - $${this.getAttribute("price")}` : ""
    }`;

    this.shadowRoot.querySelector("#description").textContent = description;

    this.shadowRoot.querySelector("#link").textContent =
      this.getAttribute("linktext");
    this.shadowRoot.querySelector("#link").href = this.getAttribute("link");
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
}

customElements.define("gift-item", GiftItem);
