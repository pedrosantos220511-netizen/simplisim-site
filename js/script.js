const WHATSAPP_NUMBER = "5511965453661";

const products = [
  {id:"arco-floral", name:"Arco Floral", category:"estruturas", label:"Estruturas", description:"Composição floral para destacar cerimônias, entradas e momentos especiais."},
  {id:"painel-floral", name:"Painel Floral", category:"flores", label:"Flores", description:"Uma presença floral marcante para criar um cenário especial."},
  {id:"mesa-bolo", name:"Mesa do Bolo", category:"mesas", label:"Mesas", description:"Composição para valorizar o bolo e os detalhes da celebração."},
  {id:"mesa-doces", name:"Mesa de Doces", category:"mesas", label:"Mesas", description:"Elementos florais para complementar a mesa de doces."},
  {id:"mesa-convidados", name:"Mesa dos Convidados", category:"mesas", label:"Mesas", description:"Arranjos e detalhes para criar uma atmosfera acolhedora."},
  {id:"cerimonia", name:"Decoração da Cerimônia", category:"cerimonia", label:"Cerimônia", description:"Elementos para compor o espaço onde a celebração acontece."},
  {id:"entrada", name:"Entrada / Recepção", category:"cerimonia", label:"Cerimônia", description:"Uma primeira impressão especial para receber os convidados."},
  {id:"buque", name:"Buquê", category:"complementos", label:"Complementos", description:"Um detalhe floral pensado para acompanhar o grande momento."},
  {id:"lapela", name:"Lapela", category:"complementos", label:"Complementos", description:"Complemento floral para noivos e participantes da celebração."},
  {id:"mini-wedding", name:"Mini Wedding", category:"eventos", label:"Eventos", description:"Soluções florais para celebrações intimistas e personalizadas."},
  {id:"casamento-civil", name:"Casamento Civil", category:"eventos", label:"Eventos", description:"Detalhes elegantes para uma celebração especial."},
  {id:"noivado", name:"Noivado", category:"eventos", label:"Eventos", description:"Decoração para marcar o início de uma nova história."},
  {id:"cha-panela", name:"Chá de Panela", category:"eventos", label:"Eventos", description:"Elementos florais para encontros cheios de personalidade."},
  {id:"bodas", name:"Bodas", category:"eventos", label:"Eventos", description:"Flores e detalhes para celebrar cada capítulo."}
];

let selectedItems = JSON.parse(localStorage.getItem("simplisimSelection") || "[]");

const productGrid = document.getElementById("productGrid");
const selectionBar = document.getElementById("selectionBar");
const selectionCount = document.getElementById("selectionCount");
const selectionModal = document.getElementById("selectionModal");
const selectedItemsContainer = document.getElementById("selectedItems");
const quoteForm = document.getElementById("quoteForm");

function saveSelection() {
  localStorage.setItem("simplisimSelection", JSON.stringify(selectedItems));
}

function isSelected(id) {
  return selectedItems.includes(id);
}

function renderProducts(filter = "todos") {
  const visible = filter === "todos"
    ? products
    : products.filter(product => product.category === filter);

  productGrid.innerHTML = visible.map(product => `
    <article class="product-card">
      <div class="product-image" role="img" aria-label="Espaço reservado para foto de ${product.name}">
        <span>FOTO DO ACERVO</span>
      </div>
      <div class="product-info">
        <span class="product-category">${product.label}</span>
        <h3>${product.name}</h3>
        <p>${product.description}</p>
        <button class="add-button ${isSelected(product.id) ? "selected" : ""}" data-id="${product.id}" type="button">
          ${isSelected(product.id) ? "✓ Adicionado à seleção" : "Adicionar à minha seleção"}
        </button>
      </div>
    </article>
  `).join("");

  productGrid.querySelectorAll(".add-button").forEach(button => {
    button.addEventListener("click", () => toggleSelection(button.dataset.id));
  });
}

function toggleSelection(id) {
  if (isSelected(id)) {
    selectedItems = selectedItems.filter(itemId => itemId !== id);
  } else {
    selectedItems.push(id);
  }
  saveSelection();
  updateSelectionUI();
  const activeFilter = document.querySelector(".filter.active")?.dataset.filter || "todos";
  renderProducts(activeFilter);
}

function updateSelectionUI() {
  const count = selectedItems.length;
  selectionCount.textContent = `${count} ${count === 1 ? "item" : "itens"}`;
  selectionBar.classList.toggle("visible", count > 0);
}

function renderSelection() {
  if (!selectedItems.length) {
    selectedItemsContainer.innerHTML = `
      <div class="selected-item">
        <span>Nenhum item selecionado ainda.</span>
        <button class="remove-item" type="button" data-close-modal>Voltar ao catálogo</button>
      </div>`;
    return;
  }

  selectedItemsContainer.innerHTML = selectedItems.map(id => {
    const product = products.find(item => item.id === id);
    return `
      <div class="selected-item">
        <strong>${product.name}</strong>
        <button class="remove-item" type="button" data-remove="${product.id}">Remover</button>
      </div>
    `;
  }).join("");

  selectedItemsContainer.querySelectorAll("[data-remove]").forEach(button => {
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

  if (name || event || date || location || guests) lines.push("");

  lines.push("Itens selecionados:", "");
  items.forEach(item => lines.push(`• ${item.name}`));

  lines.push(
    "",
    notes ? `Observações: ${notes}` : "",
    "Gostaria de verificar a disponibilidade e receber um orçamento.",
    "",
    "Obrigado(a)!"
  );

  return lines.filter((line, index) => !(line === "" && lines[index - 1] === "")).join("\n");
}

document.querySelectorAll(".filter").forEach(filterButton => {
  filterButton.addEventListener("click", () => {
    document.querySelectorAll(".filter").forEach(button => button.classList.remove("active"));
    filterButton.classList.add("active");
    renderProducts(filterButton.dataset.filter);
  });
});

document.getElementById("openSelection").addEventListener("click", openModal);
document.getElementById("closeSelection").addEventListener("click", closeModal);
document.querySelectorAll("[data-close-modal]").forEach(element => element.addEventListener("click", closeModal));

document.getElementById("b2bButton").addEventListener("click", () => {
  const message = encodeURIComponent(
    "Olá, Simplisim! Vim pelo site e tenho interesse em uma proposta B2B para decoração floral. Gostaria de conversar sobre uma solução personalizada para minha empresa/espaço."
  );
  window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${message}`, "_blank", "noopener");
});

quoteForm.addEventListener("submit", event => {
  event.preventDefault();

  if (!selectedItems.length) {
    alert("Selecione pelo menos um item antes de solicitar um orçamento.");
    return;
  }

  const items = selectedItems.map(id => products.find(product => product.id === id));
  const message = createWhatsAppMessage(new FormData(quoteForm), items);
  const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;

  window.open(url, "_blank", "noopener");
});

document.getElementById("whatsappFloat").addEventListener("click", event => {
  if (!selectedItems.length) return;
  event.preventDefault();
  const items = selectedItems.map(id => products.find(product => product.id === id));
  const message = [
    "Olá, Simplisim! Vim pelo site e gostaria de solicitar um orçamento.",
    "",
    "Minha seleção:",
    "",
    ...items.map(item => `• ${item.name}`),
    "",
    "Gostaria de verificar a disponibilidade e receber um orçamento.",
    "",
    "Obrigado(a)!"
  ].join("\n");

  window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`, "_blank", "noopener");
});

const menuToggle = document.getElementById("menuToggle");
const mainNav = document.getElementById("mainNav");

menuToggle.addEventListener("click", () => {
  const open = mainNav.classList.toggle("open");
  menuToggle.setAttribute("aria-expanded", String(open));
});

mainNav.querySelectorAll("a").forEach(link => {
  link.addEventListener("click", () => {
    mainNav.classList.remove("open");
    menuToggle.setAttribute("aria-expanded", "false");
  });
});

document.addEventListener("keydown", event => {
  if (event.key === "Escape") closeModal();
});

document.getElementById("year").textContent = new Date().getFullYear();

renderProducts();
updateSelectionUI();
