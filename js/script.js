const WHATSAPP_NUMBER = "5511965453661";

let products = [];
let selectedItems = JSON.parse(
  localStorage.getItem("simplisimSelection") || "[]"
);

const productGrid = document.getElementById("productGrid");
const selectionBar = document.getElementById("selectionBar");
const selectionCount = document.getElementById("selectionCount");
const selectionModal = document.getElementById("selectionModal");
const selectedItemsContainer = document.getElementById("selectedItems");
const quoteForm = document.getElementById("quoteForm");

function saveSelection() {
  localStorage.setItem(
    "simplisimSelection",
    JSON.stringify(selectedItems)
  );
}

function isSelected(id) {
  return selectedItems.includes(id);
}

/* =========================
   SUPABASE — PRODUTOS
========================= */

async function carregarProdutos() {
  productGrid.innerHTML = `
    <div class="catalog-loading">
      <span>Carregando catálogo...</span>
    </div>
  `;

  const { data, error } = await supabaseClient
    .from("produtos")
    .select("*")
    .eq("ativo", true)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("❌ Erro ao carregar produtos:", error);

    productGrid.innerHTML = `
      <div class="catalog-error">
        <strong>Não foi possível carregar o catálogo.</strong>
        <p>Tente atualizar a página.</p>
      </div>
    `;

    return;
  }

  products = data || [];

  console.log("✅ Produtos carregados:", products);

  renderProducts();
  updateSelectionUI();
}

/* =========================
   CATÁLOGO
========================= */

function renderProducts(filter = "todos") {
  const visible =
    filter === "todos"
      ? products
      : products.filter(
          product => normalizarCategoria(product.categoria) === filter
        );

  if (!visible.length) {
    productGrid.innerHTML = `
      <div class="catalog-empty">
        <strong>Nenhum produto encontrado.</strong>
        <p>Confira outras categorias.</p>
      </div>
    `;
    return;
  }

  productGrid.innerHTML = visible
    .map(product => {
      const id = String(product.id);

      const imagem = product.imagem_url
        ? product.imagem_url
        : "";

      return `
        <article class="product-card">

          <div
            class="product-image ${imagem ? "has-image" : ""}"
            role="img"
            aria-label="${escapeHTML(product.nome)}"
            ${
              imagem
                ? `style="background-image:url('${escapeAttribute(imagem)}')"`
                : ""
            }
          >
            ${
              imagem
                ? ""
                : `
                  <span>FOTO DO ACERVO</span>
                  <small>Imagem em breve</small>
                `
            }
          </div>

          <div class="product-info">

            <span class="product-category">
              ${escapeHTML(product.categoria || "Decoração")}
            </span>

            <h3>${escapeHTML(product.nome)}</h3>

            <p>${escapeHTML(product.descricao || "")}</p>

            ${
              product.preco !== null && product.preco !== undefined
                ? `
                  <strong class="product-price">
                    R$ ${formatPrice(product.preco)}
                  </strong>
                `
                : ""
            }

            <button
              class="add-button ${isSelected(id) ? "selected" : ""}"
              data-id="${id}"
              type="button"
            >
              ${
                isSelected(id)
                  ? "✓ Adicionado à seleção"
                  : "Adicionar à minha seleção"
              }
            </button>

          </div>

        </article>
      `;
    })
    .join("");

  productGrid.querySelectorAll(".add-button").forEach(button => {
    button.addEventListener("click", () => {
      toggleSelection(button.dataset.id);
    });
  });
}

/* =========================
   CATEGORIA
========================= */

function normalizarCategoria(categoria) {
  if (!categoria) return "";

  return categoria
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .replace(/\s+/g, "-");
}

/* =========================
   PREÇO
========================= */

function formatPrice(value) {
  return Number(value).toLocaleString("pt-BR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
}

/* =========================
   SEGURANÇA HTML
========================= */

function escapeHTML(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function escapeAttribute(value) {
  return String(value)
    .replace(/'/g, "%27")
    .replace(/"/g, "%22");
}

/* =========================
   SELEÇÃO
========================= */

function toggleSelection(id) {
  id = String(id);

  if (isSelected(id)) {
    selectedItems = selectedItems.filter(
      itemId => String(itemId) !== id
    );
  } else {
    selectedItems.push(id);
  }

  saveSelection();
  updateSelectionUI();

  const activeFilter =
    document.querySelector(".filter.active")?.dataset.filter || "todos";

  renderProducts(activeFilter);
}

function updateSelectionUI() {
  const count = selectedItems.length;

  selectionCount.textContent =
    `${count} ${count === 1 ? "item" : "itens"}`;

  selectionBar.classList.toggle("visible", count > 0);
}

/* =========================
   MODAL DA SELEÇÃO
========================= */

function renderSelection() {
  const validSelectedItems = selectedItems
    .map(id =>
      products.find(product => String(product.id) === String(id))
    )
    .filter(Boolean);

  if (!validSelectedItems.length) {
    selectedItemsContainer.innerHTML = `
      <div class="selected-item">
        <span>Nenhum item selecionado ainda.</span>
        <button
          class="remove-item"
          type="button"
          data-close-modal
        >
          Voltar ao catálogo
        </button>
      </div>
    `;

    selectedItemsContainer
      .querySelector("[data-close-modal]")
      ?.addEventListener("click", closeModal);

    return;
  }

  selectedItemsContainer.innerHTML = validSelectedItems
    .map(product => `
      <div class="selected-item">
        <strong>${escapeHTML(product.nome)}</strong>

        <button
          class="remove-item"
          type="button"
          data-remove="${product.id}"
        >
          Remover
        </button>
      </div>
    `)
    .join("");

  selectedItemsContainer
    .querySelectorAll("[data-remove]")
    .forEach(button => {
      button.addEventListener("click", () => {
        toggleSelection(button.dataset.remove);
        renderSelection();
      });
    });
}

function openModal() {
  renderSelection();

  selectionModal.classList.add("open");
  selectionModal.setAttribute("aria-hidden", "false");

  document.body.style.overflow = "hidden";
}

function closeModal() {
  selectionModal.classList.remove("open");
  selectionModal.setAttribute("aria-hidden", "true");

  document.body.style.overflow = "";
}

/* =========================
   WHATSAPP
========================= */

function createWhatsAppMessage(formData, items) {
  const lines = [
    "Olá, Simplisim!",
    "",
    "Vim pelo site e gostaria de solicitar um orçamento.",
    ""
  ];

  const name = formData.get("name")?.trim();
  const event = formData.get("event")?.trim();
  const date = formData.get("date");
  const location = formData.get("location")?.trim();
  const guests = formData.get("guests")?.trim();
  const notes = formData.get("notes")?.trim();

  if (name) lines.push(`Nome: ${name}`);
  if (event) lines.push(`Evento: ${event}`);

  if (date) {
    const [year, month, day] = date.split("-");
    lines.push(`Data: ${day}/${month}/${year}`);
  }

  if (location) lines.push(`Local: ${location}`);
  if (guests) lines.push(`Convidados: ${guests}`);

  if (name || event || date || location || guests) {
    lines.push("");
  }

  lines.push("Itens selecionados:", "");

  items.forEach(item => {
    lines.push(`• ${item.nome}`);
  });

  lines.push(
    "",
    notes ? `Observações: ${notes}` : "",
    "Gostaria de verificar a disponibilidade e receber um orçamento.",
    "",
    "Obrigado(a)!"
  );

  return lines
    .filter(
      (line, index) =>
        !(line === "" && lines[index - 1] === "")
    )
    .join("\n");
}

/* =========================
   FILTROS
========================= */

document.querySelectorAll(".filter").forEach(filterButton => {
  filterButton.addEventListener("click", () => {
    document
      .querySelectorAll(".filter")
      .forEach(button => button.classList.remove("active"));

    filterButton.classList.add("active");

    renderProducts(filterButton.dataset.filter);
  });
});

/* =========================
   BOTÕES
========================= */

document
  .getElementById("openSelection")
  ?.addEventListener("click", openModal);

document
  .getElementById("closeSelection")
  ?.addEventListener("click", closeModal);

document
  .querySelectorAll("[data-close-modal]")
  .forEach(element => {
    element.addEventListener("click", closeModal);
  });

/* =========================
   B2B
========================= */

document
  .getElementById("b2bButton")
  ?.addEventListener("click", () => {

    const message = encodeURIComponent(
      "Olá, Simplisim! Vim pelo site e tenho interesse em uma proposta B2B para decoração floral. Gostaria de conversar sobre uma solução personalizada para minha empresa/espaço."
    );

    window.open(
      `https://wa.me/${WHATSAPP_NUMBER}?text=${message}`,
      "_blank",
      "noopener"
    );
  });

/* =========================
   FORMULÁRIO
========================= */

quoteForm?.addEventListener("submit", event => {
  event.preventDefault();

  if (!selectedItems.length) {
    alert(
      "Selecione pelo menos um item antes de solicitar um orçamento."
    );
    return;
  }

  const items = selectedItems
    .map(id =>
      products.find(
        product => String(product.id) === String(id)
      )
    )
    .filter(Boolean);

  const message = createWhatsAppMessage(
    new FormData(quoteForm),
    items
  );

  const url =
    `https://wa.me/${WHATSAPP_NUMBER}?text=` +
    encodeURIComponent(message);

  window.open(url, "_blank", "noopener");
});

/* =========================
   WHATSAPP FLUTUANTE
========================= */

document
  .getElementById("whatsappFloat")
  ?.addEventListener("click", event => {

    if (!selectedItems.length) return;

    event.preventDefault();

    const items = selectedItems
      .map(id =>
        products.find(
          product => String(product.id) === String(id)
        )
      )
      .filter(Boolean);

    const message = [
      "Olá, Simplisim! Vim pelo site e gostaria de solicitar um orçamento.",
      "",
      "Minha seleção:",
      "",
      ...items.map(item => `• ${item.nome}`),
      "",
      "Gostaria de verificar a disponibilidade e receber um orçamento.",
      "",
      "Obrigado(a)!"
    ].join("\n");

    window.open(
      `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`,
      "_blank",
      "noopener"
    );
  });

/* =========================
   MENU MOBILE
========================= */

const menuToggle = document.getElementById("menuToggle");
const mainNav = document.getElementById("mainNav");

menuToggle?.addEventListener("click", () => {
  const open = mainNav.classList.toggle("open");

  menuToggle.setAttribute(
    "aria-expanded",
    String(open)
  );
});

mainNav
  ?.querySelectorAll("a")
  .forEach(link => {
    link.addEventListener("click", () => {
      mainNav.classList.remove("open");

      menuToggle.setAttribute(
        "aria-expanded",
        "false"
      );
    });
  });

/* =========================
   ESC
========================= */

document.addEventListener("keydown", event => {
  if (event.key === "Escape") {
    closeModal();
  }
});

/* =========================
   ANO
========================= */

document.getElementById("year").textContent =
  new Date().getFullYear();

/* =========================
   INICIALIZAÇÃO
========================= */

carregarProdutos();
updateSelectionUI();
