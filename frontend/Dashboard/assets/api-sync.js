const apiSync = (() => {

  // =========================
  // CONFIG
  // =========================

  const apiBase = 'http://localhost:3000';

  // =========================
  // HELPERS
  // =========================

  const formatRupiah = (value) => {
    const number = Number(value) || 0;

    return new Intl.NumberFormat(
      'id-ID',
      {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0
      }
    ).format(number);
  };

  const safeText = (value, fallback = '-') => {
    if (
      value === null ||
      value === undefined ||
      value === ''
    ) {
      return fallback;
    }

    return String(value);
  };

  const makeEmptyRow = (cols, message) => {
    return `
      <tr>
        <td colspan="${cols}"
            style="
              text-align:center;
              padding:24px;
              color:#5A607A;
            ">
          ${message}
        </td>
      </tr>
    `;
  };

  const fetchJson = async (endpoint) => {

    const response =
    await fetch(apiBase + endpoint);

    if (!response.ok) {
      throw new Error(
        `Gagal mengambil data ${endpoint}`
      );
    }

    return response.json();
  };

  const postJson = async (
    endpoint,
    body
  ) => {

    const response =
    await fetch(
      apiBase + endpoint,
      {
        method: 'POST',
        headers: {
          'Content-Type':'application/json'
        },
        body: JSON.stringify(body)
      }
    );

    if(!response.ok){

      const text =
      await response.text();

      throw new Error(
        text ||
        `Gagal mengirim data ke ${endpoint}`
      );

    }

    return response.json();

  };

  const formatDate = (dateString) => {

    const date =
    new Date(dateString);

    if(Number.isNaN(date.getTime())){
      return '-';
    }

    return date.toLocaleString(
      'id-ID',
      {
        dateStyle:'medium',
        timeStyle:'short'
      }
    );

  };

  const getStockBadge = (stock) => {

    const qty = Number(stock);

    if(qty <= 0){
      return `
        <span class="badge badge-out">
          Out of Stock
        </span>
      `;
    }

    if(qty <= 5){
      return `
        <span class="badge badge-low">
          Low Stock
        </span>
      `;
    }

    return `
      <span class="badge badge-in">
        In Stock
      </span>
    `;

  };

  // =========================
  // CUSTOMERS
  // =========================

  const loadCustomers = async () => {

    const tbody =
    document.getElementById(
      'customers-table-body'
    );

    if(!tbody) return;

    try{

      const customers =
      await fetchJson('/pelanggan');

      if(customers.length === 0){

        tbody.innerHTML =
        makeEmptyRow(
          8,
          'Tidak ada data pelanggan'
        );

        return;
      }

      tbody.innerHTML =
      customers.map(item => {

        const id =
        String(
          item.id_pelanggan || 0
        ).padStart(3,'0');

        const limit =
        Number(item.limit_kredit) || 0;

        const used =
        Number(item.sisa_hutang) || 0;

        const percent =
        limit > 0
          ? Math.round(
              (used / limit) * 100
            )
          : 0;

        return `
          <tr>

            <td>
              <span class="td-code">
                CUST-${id}
              </span>
            </td>

            <td>
              ${safeText(
                item.nama_perusahaan,
                '-'
              )}
            </td>

            <td>
              ${formatRupiah(limit)}
            </td>

            <td>
              ${formatRupiah(used)}
            </td>

            <td>
              ${percent}%
            </td>

          </tr>
        `;

      }).join('');

    }catch(error){

      tbody.innerHTML =
      makeEmptyRow(
        8,
        error.message
      );

    }

  };

  // =========================
  // SUPPLIERS
  // =========================

  const loadSuppliers = async () => {

    const tbody =
    document.getElementById(
      'suppliers-table-body'
    );

    if(!tbody) return;

    try{

      const suppliers =
      await fetchJson('/pemasok');

      if(suppliers.length === 0){

        tbody.innerHTML =
        makeEmptyRow(
          6,
          'Tidak ada data pemasok'
        );

        return;

      }

      tbody.innerHTML =
      suppliers.map(item => {

        const id =
        String(
          item.id_pemasok || 0
        ).padStart(3,'0');

        return `
          <tr>

            <td>
              ${safeText(
                item.nama_pemasok,
                '-'
              )}
            </td>

            <td>
              SUP-${id}
            </td>

            <td>
              ${safeText(
                item.kontak,
                '-'
              )}
            </td>

            <td>
              ${safeText(
                item.email,
                '-'
              )}
            </td>

          </tr>
        `;

      }).join('');

    }catch(error){

      tbody.innerHTML =
      makeEmptyRow(
        6,
        error.message
      );

    }

  };

  // =========================
  // PRODUCTS
  // =========================

  const loadProducts = async (
    search = ''
  ) => {

    const tbody =
    document.getElementById(
      'produk-table-body'
    );

    if(!tbody) return;

    try{

      let endpoint = '/produk';

      if(search){

        endpoint =
        `/produk/search?nama_produk=${encodeURIComponent(search)}`;

      }

      const products =
      await fetchJson(endpoint);

      if(products.length === 0){

        tbody.innerHTML =
        makeEmptyRow(
          6,
          'Produk tidak ditemukan'
        );

        return;

      }

      tbody.innerHTML =
      products.map(item => {

        return `
          <tr>

            <td class="td-name">
              ${safeText(
                item.nama_produk,
                '-'
              )}
            </td>

            <td class="td-price">
              ${formatRupiah(
                item.harga_beli
              )}
            </td>

            <td class="td-price">
              ${formatRupiah(
                item.harga_jual
              )}
            </td>

            <td class="td-stock">
              ${safeText(
                item.stok_total,
                '0'
              )}
            </td>

            <td>
              ${getStockBadge(
                item.stok_total
              )}
            </td>

          </tr>
        `;

      }).join('');

    }catch(error){

      tbody.innerHTML =
      makeEmptyRow(
        6,
        error.message
      );

    }

  };

  // =========================
  // DASHBOARD
  // =========================

  const loadDashboard = async () => {

    const totalProduct =
    document.getElementById(
      'dashboard-total-product'
    );

    const totalSupplier =
    document.getElementById(
      'dashboard-total-supplier'
    );

    const totalCustomer =
    document.getElementById(
      'dashboard-total-customer'
    );

    try{

      const [
        products,
        suppliers,
        customers
      ] = await Promise.all([
        fetchJson('/produk'),
        fetchJson('/pemasok'),
        fetchJson('/pelanggan')
      ]);

      if(totalProduct){

        totalProduct.textContent =
        products.length;

      }

      if(totalSupplier){

        totalSupplier.textContent =
        suppliers.length;

      }

      if(totalCustomer){

        totalCustomer.textContent =
        customers.length;

      }

    }catch(error){

      console.log(error);

    }

  };

  // =========================
  // STOCK MOVEMENT
  // =========================

  async function loadStockMovement(){

    const tbody =
    document.getElementById(
      'stock-movement-body'
    );

    if(!tbody) return;

    try{

      const data =
      await fetchJson(
        '/pergerakan-stok'
      );

      tbody.innerHTML = '';

      if(data.length === 0){

        tbody.innerHTML =
        makeEmptyRow(
          6,
          'Tidak ada data'
        );

        return;
      }

      data.forEach(item => {

        let badgeClass = '';

        if(
          item.jenis_pergerakan
          === 'MASUK'
        ){
          badgeClass = 'badge-in';
        }
        else if(
          item.jenis_pergerakan
          === 'KELUAR'
        ){
          badgeClass = 'badge-out';
        }
        else{
          badgeClass = 'badge-low';
        }

        let reference = '-';

        if(item.id_po){
          reference =
          `PO-${item.id_po}`;
        }

        if(item.id_so){
          reference =
          `SO-${item.id_so}`;
        }

        tbody.innerHTML += `

          <tr>

            <td class="td-name">
              ${item.nama_produk || '-'}
            </td>

            <td>
              ${item.nama_gudang || '-'}
            </td>

            <td>
              <span class="badge ${badgeClass}">
                ${item.jenis_pergerakan}
              </span>
            </td>

            <td class="td-stock">
              ${item.jumlah}
            </td>

            <td class="td-date">
              ${formatDate(
                item.waktu_log
              )}
            </td>

            <td>
              ${reference}
            </td>

          </tr>

        `;

      });

    }catch(error){

      tbody.innerHTML =
      makeEmptyRow(
        6,
        error.message
      );

    }

  }

  // =========================
  // PRODUCT FORM
  // =========================

  const submitNewProduct =
  async (event) => {

    event.preventDefault();

    const form =
    event.target;

    const formData =
    new FormData(form);

    const body =
    Object.fromEntries(
      formData.entries()
    );

    body.harga_beli =
    Number(body.harga_beli || 0);

    body.harga_jual =
    Number(body.harga_jual || 0);

    body.stok_total =
    Number(body.stok_total || 0);

    try{

      await postJson(
        '/produk',
        body
      );

      alert(
        'Produk berhasil ditambahkan'
      );

      form.reset();

      loadProducts();

    }catch(error){

      alert(error.message);

    }

  };

  // =========================
  // SEARCH
  // =========================

  const setupSearch = () => {

    const searchInput =
    document.getElementById(
      'search-input'
    );

    if(!searchInput) return;

    searchInput.addEventListener(
      'input',
      () => {

        const keyword =
        searchInput.value.trim();

        loadProducts(keyword);

      }
    );

  };

  // =========================
  // PRODUCT FORM
  // =========================

  const setupProductForm = () => {

    const form =
    document.getElementById(
      'product-form'
    );

    if(form){

      form.addEventListener(
        'submit',
        submitNewProduct
      );

    }

  };

  // =========================
  // INIT
  // =========================

  const init = () => {

    document.addEventListener(
      'DOMContentLoaded',
      () => {

        loadCustomers();
        loadSuppliers();
        loadProducts();
        loadDashboard();
        loadStockMovement();

        setupSearch();
        setupProductForm();

      }
    );

  };

  return { init };

})();

apiSync.init();