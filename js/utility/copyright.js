let copyright = document.querySelector('footer')

copyright.innerHTML = `<p id="copyright">
© Jouni Rantanen
  <script type="text/javascript">
    var thedate = new Date();
    document.write(thedate.getFullYear());
  </script>
</p>`