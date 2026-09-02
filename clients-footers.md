# هوية المطور في مواقع العملاء

استخدم توقيعًا واحدًا ثابتًا، من دون رقم هاتف أو رابط WhatsApp أو كلمات مفتاحية متغيرة. يظل العميل هو الناشر ومقدم الخدمة، ويُنسب إلى إسلام الشيخ فقط ما قام فعلًا بتصميمه أو تطويره.

## التوقيع العربي

```html
<p class="developer-credit">
  تم التصميم والتطوير بواسطة
  <a href="https://www.eslam-elshikh.com/" rel="author">المهندس إسلام الشيخ</a>
</p>
```

## التوقيع الإنجليزي

```html
<p class="developer-credit" dir="ltr">
  Designed &amp; developed by
  <a href="https://www.eslam-elshikh.com/" rel="author">Eng. Eslam Elshikh</a>
</p>
```

## ربط المطور في البيانات المنظمة

أضف `creator` إلى كيان `WebSite` الموجود بدل إنشاء كيان موقع مكرر. لا تضف إسلام الشيخ بوصفه `publisher` أو `provider` لموقع العميل.

```json
{
  "@type": "WebSite",
  "creator": {
    "@type": "Person",
    "@id": "https://www.eslam-elshikh.com/#person",
    "name": "إسلام الشيخ",
    "alternateName": [
      "المهندس إسلام الشيخ",
      "Eslam Elshikh",
      "Islam Elshikh"
    ],
    "url": "https://www.eslam-elshikh.com/"
  }
}
```

## تنسيق اختياري

```css
.developer-credit {
  margin: 12px 0 0;
  color: inherit;
  font-size: 0.78rem;
  line-height: 1.7;
  text-align: center;
}

.developer-credit a {
  color: inherit;
  font-weight: 700;
  text-underline-offset: 3px;
}
```

الصيغ `اسلام الشيخ` و`Islam Elshikh` أسماء بديلة صالحة داخل هوية الشخص المركزية. أما عبارات البحث مثل «إسلام الشيخ جوجل» فتُغطى في صفحة خبرة Google الرسمية ومحتواها، ولا توضع كاسم بديل في مواقع العملاء.
