import $ from "jquery";
import noUiSlider from "nouislider";
import wNumb from "wnumb";
import dnsZones from "./dnsZones.json";
import { categories, domainList } from "./domainList_";
import flow from "lodash.flow";

$(document).ready(function () {
    const $domainsCount = $("#domains-count");
    const $nameSearch = $("#name-search");
    const $priceRange = $("#price-filter");
    const $symbolsRange = $("#symbol-filter");
    const $categoryFilter = $("#category-filter");
    const $dnsZoneFilter = $("#dns-zone-filter");
    const $domainContainer = $("#domain-container");
    const $filterSubmit = $("#filter-submit");
    const $filterForm = $("#filter-form");
    const $filterShow = $("#filter-show");
    const $filterClose = $("#filter-close");

    const MOBILE_BREAKPOINT = 768;
    const USD_RATE = 2.8;

    const basketContent = [];

    const checkBoxPattern = (id, value, label) => `
        <div class="filter-checkbox">
            <input type="checkbox" id="${id}" value="${value}" />
            <label for="${id}" class="text-dark"><span>${label}</span></label>
        </div>
    `;

    const domainFormPattern = (domainFullName, price, priceUsd) => `
        <div class="domain">
            <div class="domain__title">
                <button class="btn btn__gray btn--square">
                    <i class="icon-arrow-down"></i>
                </button>
                <strong class="domain__name">${domainFullName}</strong>
            </div>
            <div class="domain__price">
                <strong class="domain__lari">${price}<span> &#8382;</span></strong>
                <span class="domain__dollar text-small">${priceUsd} $</span>
            </div>
            <button class="btn btn--square basket-btn${basketContent.includes(domainFullName) ? " active" : ""}" data-id="${domainFullName}">
                <div class="basket-btn__check"><i class="icon-check"></i></div>
                <span class="basket-btn__added">კალთაშია</span>
                <span class="basket-btn__add">დამატება</span>
                <i class="icon-basket basket-btn__icon"></i>
            </button>
        </div>
    `;

    $domainsCount.text(domainList.length);

    const toUsd = (num) => {
        return Math.round(num / USD_RATE);
    }

    const isMobile = () => {
        const viewPortWidth = $(window).width();

        return viewPortWidth <= MOBILE_BREAKPOINT
    }

    const showFilter = () => {
        $("body").css("overflow", "hidden");
        $filterForm.addClass("show");
    }

    const closeFilter = () => {
        $("body").css("overflow", "auto");
        $filterForm.removeClass("show");
    }

    const initCategoryList = ($root) => {
        const groupType = $root.attr("id");

        categories.forEach((category) => {
            const categoryId = category.id;
            const categoryName = category.name;
            const checkId = [groupType, categoryId].join("_");

            $root.append(checkBoxPattern(checkId, categoryId, categoryName))
        });

        $root.find("input[type='checkbox']").on("change", categoryFilter);
    }

    const initDnsZoneList = ($root) => {
        const groupType = $root.attr("id");

        dnsZones.forEach((dnsZone) => {
            const checkId = [groupType, dnsZone].join("_");

            $root.append(checkBoxPattern(checkId, dnsZone, dnsZone))
        })

        $root.find("input[type='checkbox']").on("change", dnsZoneFilter);
    }

    const getMinMax = numArr => {
        const min = Math.min(...numArr);
        const max = Math.max(...numArr);

        return [min, max];
    }

    const getPriceRange = () => {
        const prices = domainList.map(domain => domain.price);

        return getMinMax(prices);
    }

    const getSymbolRange = () => {
        const nameLengths = domainList.map(domain => domain.domainName.length);

        return getMinMax(nameLengths);
    }

    const initSlider = ($root, minMax, callBack) => {
        const [min, max] = minMax;

        const $fromInput = $root.find("[data-from]");
        const $toInput = $root.find("[data-to]");
        const $slider = $root.find("[data-slider]");

        const fromChange = event => slider.set([event.target.value, null]);
        const toChange = event => slider.set([null, event.target.value]);

        const slider = noUiSlider.create($slider.get(0), {
            start: minMax,
            format: wNumb({ decimals: 0 }),
            connect: true,
            range: { min, max }
        });

        $fromInput.on("change", fromChange);
        $toInput.on("change", toChange);

        slider.on("update", function (values) {
            const [from, to] = values;

            $fromInput.val(from);
            $toInput.val(to);
        });

        slider.on("set", callBack);
    }

    const updateBasketBubbles = () => {
        const $badge = $("[data-basket-btn]").find(".badge");
        if (!basketContent.length) {
            $badge.css("visibility", "hidden");
        } else {
            $badge.css("visibility", "visible").text(basketContent.length);
        }
    }

    const filterByName = (domainList) => {
        const searchValue = filterData.nameSearch;

        if (!searchValue.length) {
            return domainList;
        }

        return domainList.filter((domain) => {
            return domain.domainName.includes(searchValue);
        })
    }

    const filterByPrice = (domainList) => {
        const [minPrice, maxPrice] = filterData.priceRange;

        return domainList.filter((domain) => {
            const domainPrice = domain.price;
            return domainPrice >= minPrice && domainPrice <= maxPrice;
        })
    }

    const filterBySymbols = (domainList) => {
        const [minSymbol, maxSymbol] = filterData.symbolRange;

        return domainList.filter((domain) => {
            const domainLength = domain.domainName.length;
            return domainLength >= minSymbol && domainLength <= maxSymbol;
        })
    }

    const filterByCategory = (domainList) => {
        const categories = filterData.categories;

        if (!categories.length) {
            return domainList;
        }

        return domainList.filter((domain) => {
            return categories.some((category) => domain.categories.includes(parseInt(category)))
        })
    }

    const filterByDnsZone = (domainList) => {
        const dnsZones = filterData.dnsZones;

        if (!dnsZones.length) {
            return domainList;
        }

        return domainList.filter((domain) => {
            return dnsZones.includes(domain.domainExtension)
        })
    }

    const drawFilteredList = (filteredDomainList) => {
        const $domainList = $domainContainer.find("[data-domain-list]");
        const $domainListFallback = $domainContainer.find("[data-domain-list-fallback]");


        $domainList.show().empty();
        $domainListFallback.hide();

        if (!filteredDomainList.length) {
            $domainList.hide();
            $domainListFallback.show();
        }

        filteredDomainList.forEach((domain) => {
            const domainName = domain.domainName;
            const dnsZone = domain.domainExtension;
            const domainFullName = domainName + dnsZone;
            const price = domain.price;
            const priceUsd = toUsd(price);

            $domainList.append(domainFormPattern(domainFullName, price, priceUsd));
        })
        domainFormPattern();
    }

    const filterDomains = () => {
        return flow([
            filterByName,
            filterByPrice,
            filterBySymbols,
            filterByCategory,
            filterByDnsZone,
            drawFilteredList
        ])(domainList)
    }

    const filterData = {
        nameSearch: "",
        priceRange: getPriceRange(),
        symbolRange: getSymbolRange(),
        categories: [],
        dnsZones: [],
    }

    const nameSearch = (event) => {
        filterData.nameSearch = event.target.value;

        if (!isMobile()) { filterDomains() }
    }

    const priceFilter = ([min, max]) => {
        filterData.priceRange = [min, max];

        if (!isMobile()) { filterDomains() }
    }

    const symbolFilter = ([min, max]) => {
        filterData.symbolRange = [min, max];

        if (!isMobile()) { filterDomains() }
    }

    const categoryFilter = (event) => {
        const value = event.target.value;
        const categories = filterData.categories;

        if ($(event.target).is(':checked')) {
            categories.push(value);
        } else {
            categories.splice(categories.indexOf(value), 1);
        }

        if (!isMobile()) { filterDomains() }
    }

    const dnsZoneFilter = (event) => {
        const value = event.target.value;
        const dnsZones = filterData.dnsZones;

        if ($(event.target).is(':checked')) {
            dnsZones.push(value);
        } else {
            dnsZones.splice(dnsZones.indexOf(value), 1);
        }

        if (!isMobile()) { filterDomains() }
    }

    filterDomains();
    updateBasketBubbles();

    $nameSearch.on("input", nameSearch)

    initSlider($priceRange, getPriceRange(), priceFilter);
    initSlider($symbolsRange, getSymbolRange(), symbolFilter);

    initCategoryList($categoryFilter);
    initDnsZoneList($dnsZoneFilter);

    $filterSubmit.on("click", () => {
        if (isMobile()) {
            filterDomains();
            closeFilter();
        }
    });

    $filterShow.on("click", () => {
        if (isMobile()) {
            showFilter();
        }
    });

    $filterClose.on("click", () => {
        if (isMobile()) {
            closeFilter();
        }
    });

    $domainContainer.on("click", ".basket-btn", (event) => {
        const $that = $(event.currentTarget);
        const domainId = $that.attr("data-id");

        $that.toggleClass("active");

        if ($that.hasClass("active")) {
            basketContent.push(domainId);
        } else {
            basketContent.splice(basketContent.indexOf(domainId), 1);
        }

        updateBasketBubbles();
    })
});