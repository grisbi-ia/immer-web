<script lang="ts">
    import { textToSearch } from "$lib/stores/store";
    import { searchProducts } from "$lib/util/util";
    import { animateScroll } from "svelte-scrollto-element";

    function search() {
        animateScroll.scrollToTop();
        searchProducts(false);
    }

    function handleKeyPress(event: KeyboardEvent) {
        if (event.key === "Enter") {
            search();
        }
    }
</script>

<div class="name-filter-container">
    <form on:submit|preventDefault={search} class="search-form">
        <div class="search-input-container">
            <input
                type="text"
                placeholder="📝 Nombre o Descripción..."
                id="search-box"
                class="search-input"
                bind:value={$textToSearch}
                on:keypress={handleKeyPress}
            />
            <button type="submit" class="search-icon-btn"> 🔍 </button>
        </div>
    </form>
    <button class="btn search-btn" on:click={search}> Buscar </button>
</div>

<style>
    .name-filter-container {
        margin-bottom: 2rem;
        padding: 0;
    }

    .name-filter-container h3 {
        font-size: 1.5rem;
        margin-bottom: 1rem;
        color: #333;
        font-weight: 600;
    }

    .search-form {
        margin-bottom: 1rem;
    }

    /* Search input styling to match other filters */
    .search-input-container {
        position: relative;
        margin-bottom: 1rem;
        width: 100%;
        display: block;
    }

    .search-input {
        width: 100%;
        height: 40px;
        padding: 0 50px 0 1.2rem;
        font-size: 1.4rem;
        color: #222;
        background: #fff;
        border: 1px solid #4238ca;
        border-radius: 4px;
        outline: none;
        transition: all 0.2s ease;
        box-sizing: border-box;
        line-height: 1.4;
        vertical-align: top;
    }

    .search-input:focus {
        border-color: #2c1810;
        box-shadow: 0 0 0 2px rgba(66, 56, 202, 0.1);
    }

    .search-input:hover {
        border-color: #2c1810;
    }

    .search-input::placeholder {
        color: #999;
        font-style: normal;
    }

    .search-icon-btn {
        position: absolute;
        right: 4px;
        top: 50%;
        transform: translateY(-50%);
        background: none;
        border: none;
        color: #4238ca;
        font-size: 16px;
        cursor: pointer;
        padding: 8px;
        border-radius: 3px;
        transition: all 0.2s ease;
        display: flex;
        align-items: center;
        justify-content: center;
        height: 32px;
        width: 32px;
    }

    .search-icon-btn:hover {
        color: #2c1810;
        background-color: rgba(66, 56, 202, 0.1);
        transform: translateY(-50%) scale(1.1);
    }

    .search-btn {
        width: 100%;
        margin-top: 0.5rem;
        background-color: #4238ca;
        color: white;
        border: 1px solid #4238ca;
        padding: 0.8rem 1.2rem;
        font-size: 1.4rem;
        border-radius: 4px;
        cursor: pointer;
        transition: all 0.2s ease;
        font-weight: 500;
    }

    .search-btn:hover {
        background-color: #2c1810;
        border-color: #2c1810;
        transform: translateY(-1px);
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    }

    .search-btn:active {
        transform: translateY(0);
    }

    /* Responsive adjustments */
    @media (max-width: 768px) {
        .search-input {
            font-size: 1.6rem;
            height: 40px;
            padding-left: 1.5rem;
            padding-right: 55px;
        }

        .search-icon-btn {
            font-size: 18px;
            right: 6px;
            padding: 10px;
            height: 32px;
            width: 32px;
        }

        .search-btn {
            font-size: 1.6rem;
            padding: 1rem 1.2rem;
        }

        .name-filter-container h3 {
            font-size: 1.4rem;
        }
    }
</style>
